import os

from ultralytics import YOLO


_MODEL_PATH = os.path.join(os.path.dirname(__file__), "best.pt")
model = YOLO(_MODEL_PATH)
  # apna drone model

def detect_drones(image_path: str):
    results = model(image_path)
    detections = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            label = model.names[cls_id]
            detections.append({"label": label, "confidence": round(conf, 2)})
    return detections
