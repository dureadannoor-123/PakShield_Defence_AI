from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.concurrency import run_in_threadpool
import io
import json
from datetime import datetime
from pathlib import Path
from typing import Any
import uvicorn
import numpy as np

# Import our custom modules
from Backend.AIThreatIntelligence.email_classify import email_extract
from Backend.AIThreatIntelligence.IDS import predict_from_csv
from Backend.Survilleance.app import Anomly_detection as anomaly_detection
from Backend.Survilleance.app import Face_Recognition as face_recognition
from Backend.Survilleance.app import Weapon_detection as weapon_detection

app = FastAPI(
    title="AI Defence Platform API",
    description="Endpoints for Threat Intelligence, Border Anomaly, and AI Surveillance modules",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.100.5:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
BORDER_ANOMALY_DIR = BASE_DIR / "Backend" / "BorderAnomly"
DRONE_UPLOAD_DIR = BORDER_ANOMALY_DIR / "drones" / "uploads"
DRONE_OUTPUT_DIR = BORDER_ANOMALY_DIR / "drones" / "outputs"
HUMAN_UPLOAD_DIR = BORDER_ANOMALY_DIR / "HUMAN_DETECTION" / "uploads"
HUMAN_LOG_DIR = BORDER_ANOMALY_DIR / "HUMAN_DETECTION" / "logs"
SUSPICIOUS_UPLOAD_DIR = BORDER_ANOMALY_DIR / "Suspicious_Activity_Detection_master" / "uploads"
SUSPICIOUS_OUTPUT_DIR = BORDER_ANOMALY_DIR / "Suspicious_Activity_Detection_master" / "output video"

SURVEILLANCE_DIR = BASE_DIR / "Backend" / "Survilleance"
SURV_UPLOAD_DIR = SURVEILLANCE_DIR / "uploads"
SURV_OUTPUT_DIR = SURVEILLANCE_DIR / "outputs"
SURV_LOG_DIR = SURVEILLANCE_DIR / "logs"
SURV_ANOMALY_UPLOAD_DIR = SURV_UPLOAD_DIR / "anomaly"
SURV_ANOMALY_OUTPUT_DIR = SURV_OUTPUT_DIR / "anomaly"
SURV_ANOMALY_LOG_DIR = SURV_LOG_DIR / "anomaly"
SURV_WEAPON_UPLOAD_DIR = SURV_UPLOAD_DIR / "weapon"
SURV_WEAPON_OUTPUT_DIR = SURV_OUTPUT_DIR / "weapon"
SURV_WEAPON_LOG_DIR = SURV_LOG_DIR / "weapon"
SURV_FACE_UPLOAD_DIR = SURV_UPLOAD_DIR / "face"
SURV_FACE_OUTPUT_DIR = SURV_OUTPUT_DIR / "face"
SURV_FACE_LOG_DIR = SURV_LOG_DIR / "face"
SURV_KNOWN_FACES_DIR = SURVEILLANCE_DIR / "known_faces"

for directory in (
    DRONE_UPLOAD_DIR,
    DRONE_OUTPUT_DIR,
    HUMAN_UPLOAD_DIR,
    HUMAN_LOG_DIR,
    SUSPICIOUS_UPLOAD_DIR,
    SUSPICIOUS_OUTPUT_DIR,
    SURV_UPLOAD_DIR,
    SURV_OUTPUT_DIR,
    SURV_LOG_DIR,
    SURV_ANOMALY_UPLOAD_DIR,
    SURV_ANOMALY_OUTPUT_DIR,
    SURV_ANOMALY_LOG_DIR,
    SURV_WEAPON_UPLOAD_DIR,
    SURV_WEAPON_OUTPUT_DIR,
    SURV_WEAPON_LOG_DIR,
    SURV_FACE_UPLOAD_DIR,
    SURV_FACE_OUTPUT_DIR,
    SURV_FACE_LOG_DIR,
    SURV_KNOWN_FACES_DIR,
):
    directory.mkdir(parents=True, exist_ok=True)

def _get_drone_detector():
    try:
        from Backend.BorderAnomly.drones.detector import detect_drones as detect_drones_from_path

        return detect_drones_from_path
    except Exception as exc:  # pragma: no cover - runtime dependency issues
        raise HTTPException(status_code=500, detail=f"Drone detector unavailable: {exc}") from exc


def _get_human_detector():
    try:
        from Backend.BorderAnomly.HUMAN_DETECTION.detector import detect_humans as detect_humans_from_path

        return detect_humans_from_path
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Human detector unavailable: {exc}") from exc


def _get_suspicious_detector():
    try:
        from Backend.BorderAnomly.Suspicious_Activity_Detection_master.detection import (
            detect_shoplifting,
        )

        return detect_shoplifting
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Suspicious activity detector unavailable: {exc}") from exc


def _store_upload(data: bytes, directory: Path, original_name: str | None, fallback_suffix: str) -> Path:
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    raw_name = Path(original_name or f"upload{fallback_suffix}").name
    stem = Path(raw_name).stem or "upload"
    suffix = Path(raw_name).suffix or fallback_suffix
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%S%f")
    safe_name = f"{stem}_{timestamp}{suffix}"
    path = directory / safe_name
    path.write_bytes(data)
    return path


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    
    # Custom JSON serializer to handle numpy types and other objects
    def json_serializer(obj):
        if hasattr(obj, 'dtype'):  # numpy types
            return float(obj) if obj.dtype.kind in 'fc' else int(obj)
        elif isinstance(obj, (np.bool_, bool)):
            return bool(obj)
        elif hasattr(obj, 'tolist'):  # numpy arrays
            return obj.tolist()
        else:
            return str(obj)
    
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False, default=json_serializer))


def _is_video(name: str, content_type: str | None = None) -> bool:
    lowered = name.lower()
    content_type = (content_type or "").lower()
    return (
        content_type.startswith("video/")
        or lowered.endswith((".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"))
    )


def _is_image(name: str, content_type: str | None = None) -> bool:
    lowered = name.lower()
    content_type = (content_type or "").lower()
    return (
        content_type.startswith("image/")
        or lowered.endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp"))
    )

FILE_CATEGORY_MAP = {
    "drones-inputs": DRONE_UPLOAD_DIR,
    "drones-reports": DRONE_OUTPUT_DIR,
    "human-videos": HUMAN_UPLOAD_DIR,
    "human-logs": HUMAN_LOG_DIR,
    "suspicious-inputs": SUSPICIOUS_UPLOAD_DIR,
    "suspicious-videos": SUSPICIOUS_OUTPUT_DIR,
    "surveillance-anomaly-inputs": SURV_ANOMALY_UPLOAD_DIR,
    "surveillance-anomaly-outputs": SURV_ANOMALY_OUTPUT_DIR,
    "surveillance-anomaly-logs": SURV_ANOMALY_LOG_DIR,
    "surveillance-weapon-inputs": SURV_WEAPON_UPLOAD_DIR,
    "surveillance-weapon-outputs": SURV_WEAPON_OUTPUT_DIR,
    "surveillance-weapon-logs": SURV_WEAPON_LOG_DIR,
    "surveillance-face-inputs": SURV_FACE_UPLOAD_DIR,
    "surveillance-face-outputs": SURV_FACE_OUTPUT_DIR,
    "surveillance-face-logs": SURV_FACE_LOG_DIR,
}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Defence Platform API",
        "endpoints": {
            "GET /email-classify": "Email phishing intelligence (Threat Intelligence)",
            "POST /ids-predict": "Network intrusion detection (Threat Intelligence)",
            "POST /border/drones/detect": "Drone detection (Border Anomaly)",
            "POST /border/suspicious/detect": "Suspicious activity detection (Border Anomaly)",
            "POST /border/humans/detect": "Night thermal person detection (Border Anomaly)",
            "POST /surveillance/anomaly/detect": "Restricted-area anomaly detection (AI Surveillance)",
            "POST /surveillance/weapon/detect": "Weapon detection (AI Surveillance)",
            "POST /surveillance/face/recognize": "Face recognition per watchlist (AI Surveillance)",
            "GET /border/files/{category}/{filename}": "Download processed outputs (image/video/log)",
        },
    }

@app.get("/email-classify")
async def classify_emails():
    """
    Extract unseen emails from Gmail and classify them for phishing detection.
    Returns: List of emails with sender info and classification status.
    """
    try:
        results = email_extract()
        return {
            "status": "success",
            "message": f"Processed {len(results)} emails",
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing emails: {str(e)}")

@app.post("/ids-predict")
async def predict_intrusion(file: UploadFile = File(...)):
    """
    Upload a CSV file for network intrusion detection.
    Accepts: CSV file with network traffic data
    Returns: Predictions for each row in the CSV
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        # Read the uploaded file
        contents = await file.read()
        csv_string = contents.decode('utf-8')
        csv_file = io.StringIO(csv_string)
        
        # Get predictions using our IDS module
        predictions = predict_from_csv(csv_file)
        
        # Convert predictions to list for JSON serialization
        predictions_list = predictions.tolist() if hasattr(predictions, 'tolist') else list(predictions)
        
        return {
            "status": "success",
            "message": f"Processed {len(predictions_list)} records",
            "filename": file.filename,
            "predictions": predictions_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV file: {str(e)}")


@app.post("/border/drones/detect")
async def detect_drones(file: UploadFile = File(...)):
    """Upload an image and run drone detection."""

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed for drone detection.")

    try:
        data = await file.read()
        detector = _get_drone_detector()
        image_path = _store_upload(data, DRONE_UPLOAD_DIR, file.filename, ".jpg")
        detections = detector(str(image_path))
        report_path = DRONE_OUTPUT_DIR / f"{image_path.stem}_detections.json"
        report_path.write_text(json.dumps(detections, indent=2, ensure_ascii=False))
        return {
            "status": "success",
            "filename": file.filename,
            "detections_count": len(detections),
            "detections": detections,
            "image_url": f"/border/files/drones-inputs/{image_path.name}",
            "report_url": f"/border/files/drones-reports/{report_path.name}",
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Drone detection failed: {str(exc)}") from exc


@app.post("/border/humans/detect")
async def detect_humans(file: UploadFile = File(...)):
    """Upload a video and run human detection."""

    content_type = file.content_type or ""
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed for human detection.")

    try:
        data = await file.read()
        detector = _get_human_detector()
        video_path = _store_upload(data, HUMAN_UPLOAD_DIR, file.filename, ".mp4")
        detections = detector(str(video_path), conf_threshold=0.6, play_alarm_flag=False)
        stats = {
            "total_detections": len(detections),
            "unique_frames": len({item.get("frame_number") for item in detections if "frame_number" in item}),
        }
        preview = detections[:10]
        log_path = HUMAN_LOG_DIR / f"{video_path.stem}_detections.json"
        log_path.write_text(json.dumps(detections, indent=2, ensure_ascii=False))
        return {
            "status": "success",
            "filename": file.filename,
            "stats": stats,
            "preview_detections": preview,
            "video_url": f"/border/files/human-videos/{video_path.name}",
            "log_url": f"/border/files/human-logs/{log_path.name}",
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Human detection failed: {str(exc)}") from exc


@app.post("/border/suspicious/detect")
async def detect_suspicious_activity(file: UploadFile = File(...)):
    """Upload a video and run suspicious activity (shoplifting) detection."""

    content_type = file.content_type or ""
    if not content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Only video files are allowed for suspicious activity detection.")

    try:
        data = await file.read()
        detector = _get_suspicious_detector()
        input_video = _store_upload(data, SUSPICIOUS_UPLOAD_DIR, file.filename, ".mp4")
        output_path = Path(detector(str(input_video)))
        stats = {
            "input_video_url": f"/border/files/suspicious-inputs/{input_video.name}",
            "output_size_bytes": output_path.stat().st_size if output_path.exists() else None,
        }
        return {
            "status": "success",
            "filename": file.filename,
            "stats": stats,
            "video_url": f"/border/files/suspicious-videos/{output_path.name}",
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Suspicious activity detection failed: {str(exc)}") from exc


@app.post("/surveillance/anomaly/detect")
async def detect_surveillance_anomaly(file: UploadFile = File(...)):
    """Upload an image or video and run restricted-area anomaly detection."""

    filename = file.filename or "upload"
    if not (_is_video(filename, file.content_type) or _is_image(filename, file.content_type)):
        raise HTTPException(status_code=400, detail="Only image or video files are allowed for anomaly detection.")

    data = await file.read()
    is_video = _is_video(filename, file.content_type)

    try:
        if is_video:
            input_path = _store_upload(data, SURV_ANOMALY_UPLOAD_DIR, filename, ".mp4")
            output_path = SURV_ANOMALY_OUTPUT_DIR / f"{input_path.stem}_annotated.mp4"
            summary = await run_in_threadpool(
                anomaly_detection.analyze_video,
                str(input_path),
                str(output_path),
            )
        else:
            input_path = _store_upload(data, SURV_ANOMALY_UPLOAD_DIR, filename, ".jpg")
            output_path = SURV_ANOMALY_OUTPUT_DIR / f"{input_path.stem}_annotated.jpg"
            summary = await run_in_threadpool(
                anomaly_detection.analyze_image,
                str(input_path),
                str(output_path),
            )

        log_path = SURV_ANOMALY_LOG_DIR / f"{input_path.stem}_summary.json"
        _write_json(log_path, summary)

        return {
            "status": "success",
            "filename": filename,
            "media_type": "video" if is_video else "image",
            "summary": summary,
            "input_url": f"/border/files/surveillance-anomaly-inputs/{input_path.name}",
            "output_url": f"/border/files/surveillance-anomaly-outputs/{output_path.name}",
            "log_url": f"/border/files/surveillance-anomaly-logs/{log_path.name}",
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Surveillance anomaly detection failed: {exc}") from exc


@app.post("/surveillance/weapon/detect")
async def detect_surveillance_weapons(file: UploadFile = File(...)):
    """Upload an image or video and run weapon detection."""

    filename = file.filename or "upload"
    if not (_is_video(filename, file.content_type) or _is_image(filename, file.content_type)):
        raise HTTPException(status_code=400, detail="Only image or video files are allowed for weapon detection.")

    data = await file.read()
    is_video = _is_video(filename, file.content_type)

    try:
        if is_video:
            input_path = _store_upload(data, SURV_WEAPON_UPLOAD_DIR, filename, ".mp4")
            output_path = SURV_WEAPON_OUTPUT_DIR / f"{input_path.stem}_annotated.mp4"
            summary = await run_in_threadpool(
                weapon_detection.analyze_video,
                str(input_path),
                str(output_path),
            )
        else:
            input_path = _store_upload(data, SURV_WEAPON_UPLOAD_DIR, filename, ".jpg")
            output_path = SURV_WEAPON_OUTPUT_DIR / f"{input_path.stem}_annotated.jpg"
            summary = await run_in_threadpool(
                weapon_detection.analyze_image,
                str(input_path),
                str(output_path),
            )

        log_path = SURV_WEAPON_LOG_DIR / f"{input_path.stem}_summary.json"
        _write_json(log_path, summary)

        return {
            "status": "success",
            "filename": filename,
            "media_type": "video" if is_video else "image",
            "summary": summary,
            "input_url": f"/border/files/surveillance-weapon-inputs/{input_path.name}",
            "output_url": f"/border/files/surveillance-weapon-outputs/{output_path.name}",
            "log_url": f"/border/files/surveillance-weapon-logs/{log_path.name}",
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Surveillance weapon detection failed: {exc}") from exc


@app.post("/surveillance/face/recognize")
async def recognize_surveillance_faces(file: UploadFile = File(...)):
    """Upload an image or video and run face recognition against known faces."""

    filename = file.filename or "upload"
    if not (_is_video(filename, file.content_type) or _is_image(filename, file.content_type)):
        raise HTTPException(status_code=400, detail="Only image or video files are allowed for face recognition.")

    data = await file.read()
    is_video = _is_video(filename, file.content_type)

    known_faces_dir = SURV_KNOWN_FACES_DIR

    try:
        if is_video:
            input_path = _store_upload(data, SURV_FACE_UPLOAD_DIR, filename, ".mp4")
            output_path = SURV_FACE_OUTPUT_DIR / f"{input_path.stem}_annotated.mp4"
            summary = await run_in_threadpool(
                face_recognition.recognize_video,
                str(input_path),
                str(output_path),
                str(known_faces_dir),
            )
        else:
            input_path = _store_upload(data, SURV_FACE_UPLOAD_DIR, filename, ".jpg")
            output_path = SURV_FACE_OUTPUT_DIR / f"{input_path.stem}_annotated.jpg"
            summary = await run_in_threadpool(
                face_recognition.recognize_image,
                str(input_path),
                str(output_path),
                str(known_faces_dir),
            )

        # Ensure summary is JSON serializable
        def make_json_safe(obj):
            """Recursively convert object to JSON-safe format"""
            if obj is None or isinstance(obj, (str, bool)):
                return obj
            elif isinstance(obj, (int, float)):
                # Handle numpy types
                return float(obj) if hasattr(obj, 'dtype') else obj
            elif isinstance(obj, (list, tuple)):
                return [make_json_safe(item) for item in obj]
            elif isinstance(obj, dict):
                return {str(k): make_json_safe(v) for k, v in obj.items()}
            else:
                # Convert everything else to string
                return str(obj)

        safe_summary = make_json_safe(summary)
        
        log_path = SURV_FACE_LOG_DIR / f"{input_path.stem}_summary.json"
        _write_json(log_path, safe_summary)
        
        # Ensure we have the expected structure
        if isinstance(safe_summary, dict):
            # Add counts for easy access
            if "detections" in safe_summary:
                detections = safe_summary["detections"]
                if isinstance(detections, list):
                    safe_summary["faces_detected"] = len(detections)
                    safe_summary["known_faces"] = sum(1 for det in detections if det.get("authorized", False))
                    safe_summary["unknown_faces"] = sum(1 for det in detections if not det.get("authorized", False))
            
            # For video processing results
            if "authorized_events" in safe_summary:
                events = safe_summary["authorized_events"]
                if isinstance(events, list):
                    safe_summary["known_faces"] = len(events)
                    safe_summary["faces_detected"] = safe_summary.get("detections_total", len(events))
                    safe_summary["unknown_faces"] = safe_summary.get("faces_detected", 0) - safe_summary.get("known_faces", 0)
        else:
            safe_summary = {"message": str(summary), "faces_detected": 0, "known_faces": 0, "unknown_faces": 0}

        return {
            "status": "success",
            "filename": filename,
            "media_type": "video" if is_video else "image",
            "summary": safe_summary,
            "input_url": f"/border/files/surveillance-face-inputs/{input_path.name}",
            "output_url": f"/border/files/surveillance-face-outputs/{output_path.name}",
            "log_url": f"/border/files/surveillance-face-logs/{log_path.name}",
        }
    except ValueError as exc:
        print(f"[ERROR] ValueError in face recognition: {exc}")
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        print(f"[ERROR] Exception in face recognition: {exc}")
        print(f"[ERROR] Exception type: {type(exc)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Surveillance face recognition failed: {exc}") from exc


@app.get("/border/files/{category}/{filename}")
async def download_processed_file(category: str, filename: str):
    """Serve processed media/log files produced by detection endpoints."""

    directory = FILE_CATEGORY_MAP.get(category)
    if directory is None:
        raise HTTPException(status_code=404, detail="Unknown file category")

    safe_name = Path(filename).name
    if safe_name != filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = directory / safe_name

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    suffix = file_path.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        media_type = "image/jpeg"
    elif suffix == ".png":
        media_type = "image/png"
    elif suffix in {".mp4", ".mov", ".avi"}:
        media_type = "video/mp4"
    elif suffix == ".csv":
        media_type = "text/csv"
    else:
        media_type = "application/octet-stream"

    return FileResponse(path=str(file_path), media_type=media_type, filename=safe_name)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Threat Intelligence API"}

if __name__ == "__main__":
    print("Starting AI Threat Intelligence API...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
