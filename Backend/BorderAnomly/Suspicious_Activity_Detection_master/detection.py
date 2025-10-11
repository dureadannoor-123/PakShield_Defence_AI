import os
from pathlib import Path

import cv2
from ultralytics import YOLO


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = BASE_DIR / "best.pt"
DEFAULT_OUTPUT_DIR = BASE_DIR / "output video"

class ShopliftingDetectionBackend:
    def __init__(self, model_path: str | os.PathLike = DEFAULT_MODEL_PATH,
                 video_path: str | os.PathLike = BASE_DIR / "test.mp4",
                 output_path: str | os.PathLike = BASE_DIR / "detected.mp4"):
        self.model_path = Path(model_path)
        self.video_path = Path(video_path)
        self.output_path = Path(output_path)

        # Run the full pipeline
        self.load_model()
        self.open_video()
        self.setup_writer()
        self.run_detection()
        self.cleanup()

    def load_model(self):
        print(f"[INFO] Loading YOLO model from {self.model_path} ...")
        self.model = YOLO(str(self.model_path))

    def open_video(self):
        print(f"[INFO] Opening video: {self.video_path}")
        self.cap = cv2.VideoCapture(str(self.video_path))
        if not self.cap.isOpened():
            raise Exception("Error: Cannot open video file!")

        # get video properties
        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    def setup_writer(self):
        print(f"[INFO] Preparing output file: {self.output_path}")
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        self.out = cv2.VideoWriter(str(self.output_path), fourcc, self.fps, (self.width, self.height))

    def run_detection(self):
        print("[INFO] Starting detection...")
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            # run YOLO detection
            results = self.model(frame)
            annotated_frame = results[0].plot()

            # save annotated frame
            self.out.write(annotated_frame)

        print("[INFO] Detection finished.")

    def cleanup(self):
        print("[INFO] Releasing resources...")
        self.cap.release()
        self.out.release()
        cv2.destroyAllWindows()
        print(f"✅ Detection complete, saved at {self.output_path}")


def detect_shoplifting(video_path: str | os.PathLike,
                       model_path: str | os.PathLike = DEFAULT_MODEL_PATH,
                       output_dir: str | os.PathLike = DEFAULT_OUTPUT_DIR) -> str:
    """Run shoplifting detection on ``video_path`` and return the output video path."""

    video_path = Path(video_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / f"{video_path.stem}_output.mp4"

    ShopliftingDetectionBackend(
        model_path=model_path,
        video_path=video_path,
        output_path=output_path,
    )

    return str(output_path)


if __name__ == "__main__":
    sample_video = BASE_DIR / "istockphoto-1391833001-640_adpp_is.mp4"
    detect_shoplifting(sample_video)
