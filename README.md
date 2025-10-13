<p align="center">
  <img
    src="https://capsule-render.vercel.app/api?type=waving&height=200&section=header&text=PakShield%20Defence%20AI&fontSize=45&fontColor=ffffff&animation=fadeIn&fontAlignY=38&color=0A2472&v=12"
    width="100%"
    alt="PakShield Defence AI"
  />
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0A2472" width="100%" alt="blue line"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/YOLOv8-Model-blue?logo=python&logoColor=white" alt="YOLOv8"/>
  <img src="https://img.shields.io/badge/OpenCV-Computer%20Vision-0A2472?logo=opencv&logoColor=white" alt="OpenCV"/>
  <img src="https://img.shields.io/badge/AI%20Defense-Security%20Intelligence-0A2472" alt="AI Defense"/>
  <img src="https://img.shields.io/badge/Python-Backend-yellow?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Vercel-Deployment-black?logo=vercel" alt="Vercel"/>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0A2472" width="100%" alt="blue line"/>
</p>

## 🧠 Project Overview

**PakShield Defence AI** is an **AI-powered autonomous defense system** designed to enhance national security through real-time **threat detection and situational awareness**.  
It integrates **drone, weapon, and human detection modules** using advanced computer vision and AI analytics, ensuring **rapid identification of potential threats** at borders and restricted zones.  

🚀 Developed with precision by a skilled team:
- **Afnan Shoukat** – Lead Vision & Integration  
- **Usama Shahid** – Backend & AI Architecture  
- **Dure Addan Noor** – UI & Data Coordination  

🌐 **Live Demo:** [pakshieldai.vercel.app](https://pakshieldai.vercel.app)  
🔗 **LinkedIn:** [Afnan Shoukat](https://linkedin.com/in/afnanshoukat) · [Usama Shahid](https://linkedin.com/in/-usamashahid) · [Dure Addan Noor](https://linkedin.com/in/adannoor)


<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0A2472" width="100%" alt="blue line"/>
</p>

## ✨ Key Features


### 🧩 1. AI Threat Intelligence  
> **Smart security at the data layer**

- 📧 **Email Phishing Detection** — Identifies malicious emails and phishing attempts using NLP-based classification.  
- 🛡️ **Network Intrusion Detection** — Monitors network packets and detects abnormal activity patterns using trained ML models.  
- ⚙️ Real-time inference with **FastAPI backend** and **automated alert system** for instant action.  

### 🎥 2. Autonomous Video Surveillance  
> **Eyes that never blink**

- 🔫 **Weapon Detection** — Detects firearms, knives, or other weapons using custom-trained YOLOv8 models.  
- 🧍 **Face Recognition** — Identifies authorized vs. unauthorized individuals with embedding-based recognition.  
- 🚨 **Suspicious Activity Detection** — Flags abnormal behavior using motion trajectory and object analysis.  
- 🤖 **Anomaly Detection** — AI-driven pattern recognition for detecting irregular or unexpected visual events.  
- 🧩 Modular FastAPI endpoints for each vision model — optimized for real-time edge deployment.  



### 🌍 3. Border Anomaly Detection  
> **Defending the unseen borders**

- 🚁 **Drone Detection** — Uses aerial object recognition model (`best.pt`) for identifying drones in real-time.  
- 🌙 **Thermal Human Detection** — Detects human presence in night vision or thermal camera feeds.  
- 🕵️ **Suspicious Movement Tracking** — Tracks movement patterns to differentiate humans, animals, or machines.  
- 🗄️ Lightweight model integration supporting YOLOv11 transfer learning and custom datasets.  



### ⚙️ Additional Highlights  
- 🧠 Hybrid mix of **scratch-trained & transfer-learned YOLO models**  
- 🔗 Integrated **React + Next.js frontend** with a modern, responsive dashboard  
- 📡 FastAPI-based backend with modular endpoints  
- 🧾 Organized folder structure for **AI modules, API, config, and assets**  
- 💾 Google Drive model syncing script for large files (auto-download ready)  
- 🔐 Secured access pipeline for deployment & model versioning  

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=2&color=0A2472" width="100%" alt="blue line"/>
</p>

## 🏗️ Architecture / System Design


**PakShield AI** follows a **modular multi-agent architecture** that integrates real-time defense analytics, video surveillance intelligence, and cyber threat detection under one unified framework.

### 🧩 System Overview

```mermaid
flowchart TD
    A[Data Sources] -->|Video Streams / Network Logs / Alerts| B[Data Preprocessing]
    B --> C[AI Models Layer]
    C --> C1[Weapon Detection (YOLOv8)]
    C --> C2[Drone Detection (YOLOv11)]
    C --> C3[Suspicious Activity Detection]
    C --> C4[Cyber Threat Classifier (Logistic Regression)]
    C --> D[Decision Engine]
    D --> E[Alert & Response Module]
    E --> F[Dashboard / Vercel Frontend]
    F --> G[Security Teams & Defense Analysts]
```

### ⚙️ Components Breakdown

* **Data Sources** – Real-time feeds from surveillance cameras, drones, and network activity logs.
* **Preprocessing Engine** – Cleans, formats, and synchronizes data for model input.
* **AI Models Layer** – Deep learning modules for detection and classification.
* **Decision Engine** – Integrates multi-model outputs to evaluate threat levels.
* **Alert & Response Module** – Sends notifications and generates reports.
* **Dashboard (Vercel)** – Frontend for real-time visualization and management.





<div align="center">

# 🛡️ **PAKSHIELD AI**

### *Defend Smarter, Act Faster, Secure Always.*

[![Last Commit](https://img.shields.io/github/last-commit/fewgets/PakShieldAI?color=blue)]()
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-success?logo=fastapi)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Detection-orange?logo=yolo)
![AI](https://img.shields.io/badge/Artificial_Intelligence-Enabled-blueviolet)

<p align="center">
  <img src="https://img.shields.io/badge/Numpy-0175C2?logo=numpy&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenCV-5C3EE8?logo=opencv&logoColor=white"/>
  <img src="https://img.shields.io/badge/Pandas-150458?logo=pandas&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Next.js-black?logo=next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/YoloV8/YoloV11-orange"/>
  <img src="https://img.shields.io/badge/Pydantic-efefef?logo=pydantic&logoColor=blue"/>
</p>

</div>

---

## 🚀 **Live Demo**
🔗 **Frontend (Deployed on Vercel):**  
👉 [https://pakshieldai.vercel.app](https://pakshieldai.vercel.app)

> 🧠 *Experience real-time AI-driven defence — from border surveillance to cyber threat detection.*

---

## 🖼️ **Project Snapshots**

| Dashboard | Intrusion Detection | Face Recognition |
|------------|--------------------|------------------|
| ![Dashboard](Images/dashboard.png) | ![Intrusion](Images/intrusion_detection.png) | ![Face](Images/face_recognition.png) |

| Drone Detection | Weapon Detection | Email Phishing / Anomaly Detection |
|------------------|------------------|-----------------------------------|
| ![Drone](Images/drone_detection.png) | ![Weapon](Images/weapon_detection.png) | ![Anomaly](Images/anomaly_detection.png) |

---

## 🧩 **System Architecture Visualization**

```mermaid
flowchart TD
    A[Data Input] --> B[AI Threat Intelligence]
    A --> C[Video Surveillance]
    A --> D[Border Anomaly Detection]

    B --> B1[Email Phishing Detection]
    B --> B2[Network Intrusion Detection]

    C --> C1[Weapon Detection]
    C --> C2[Face Recognition]
    C --> C3[Anomaly Detection]
    C --> C4[Suspicious Activity Detection]

    D --> D1[Drone Detection]
    D --> D2[Thermal Human Detection]
    D --> D3[Border Suspicious Activity Detection]

    E[FastAPI Backend] --> F[Next.js Frontend]
    F --> G[User Dashboard + Alerts]

---

## 🚀 Project Overview

### 🔰 Core Pillars

1. **AI Threat Intelligence**

   * Email Phishing Detection
   * Network Intrusion Detection

2. **Autonomous Video Surveillance**

   * Weapon Detection
   * Face Recognition
   * Anomaly Detection
   * Suspicious Activity Detection

3. **Border Anomaly Detection**

   * Drone Detection
   * Thermal Human Detection (Night Vision)
   * Suspicious Activity Detection

Each category operates under a unified defense pipeline that uses Python-based backend intelligence (FastAPI) and React + Next.js (TypeScript) frontend for real-time interaction and control.

---

## 🧠 Technology Stack

| Layer               | Technology                             | Description                                        |
| ------------------- | -------------------------------------- | -------------------------------------------------- |
| **Backend**         | Python, FastAPI                        | RESTful API handling AI inference and data flow    |
| **Frontend**        | React, Next.js (TypeScript)            | Modern, responsive web interface for visualization |
| **AI Frameworks**   | PyTorch, YOLOv8, YOLOv11, Scikit-learn | Core ML models for detection & classification      |
| **Database**        | PostgreSQL / Supabase                  | For storing logs, results, and user analytics      |
| **Cloud / Storage** | Google Drive                           | For hosting large model files like `best.pt`       |

---

## 📂 Folder Structure

```
PakShieldAI/
│
├── Backend/
│   ├── AIThreatIntelligence/
│   │   ├── phishing_detection/
│   │   ├── intrusion_network_detection/
│   │
│   ├── BorderAnomly/
│   │   ├── drones/
│   │   │   └── best.pt  # Large model file (Download from Google Drive)
│   │   ├── thermal_detection/
│   │   └── suspicious_activity/
│   │
│   ├── Survillence/
│   │   ├── weapon_detection/
│   │   ├── face_recognition/
│   │   ├── anomaly_detection/
│   │   └── suspicious_activity/
│   │
│   ├── api.py
│   └── requirements.txt
│
├── Frontend/
│   ├── app/
│   ├── components/
│   ├── config/
│   │   └── config.js  # Backend API endpoints
│   ├── pages/
│   └── package.json
│
└── README.md
```

---

## 🌐 Live Demo

**Frontend URL:** [https://pakshieldai.vercel.app](https://pakshieldai.vercel.app)
*(Live preview may take a few seconds to load as APIs initialize.)*

---

## 💻 How to Clone & Run Locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/fewgets/PakShieldAI.git
cd PakShieldAI
```

### 2️⃣ Setup Backend (Python + FastAPI)

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn api:app --reload
```

### 3️⃣ Setup Frontend (Next.js + TypeScript)

```bash
cd ../Frontend
npm install
npm run dev
```

Access frontend at [http://localhost:3000](http://localhost:3000)

---

## 🔬 Module Functionality Breakdown

### 🧩 AI Threat Intelligence

#### 1. **Email Phishing Detection**

* Model: Custom CNN + TF-IDF + Logistic Regression
* Dataset: Kaggle Phishing Email Dataset
* Functionality: Detects phishing attempts from subject, content, and sender patterns.

#### 2. **Network Intrusion Detection**

* Model: Decision Tree + Deep Neural Network Hybrid
* Dataset: KDDCup99
* Detects abnormal traffic patterns and prevents unauthorized access attempts.

---

### 🎥 Autonomous Video Surveillance

#### 1. **Weapon Detection**

* Model: YOLOv8 (transfer learning)
* Detects firearms and melee weapons in real-time CCTV streams.

#### 2. **Face Recognition**

* Model: FaceNet (pretrained)
* Used for suspect identification and personnel verification.

#### 3. **Anomaly Detection**

* Model: Autoencoder-based motion anomaly detector.
* Identifies irregular human or object movements in restricted zones.

#### 4. **Suspicious Activity Detection**

* Uses YOLOv11 for behavior-based analysis (e.g., theft, trespassing).

---

### 🌍 Border Anomaly Detection

#### 1. **Drone Detection**

* Model: YOLOv8 (Custom-trained)
* Location: `Backend/BorderAnomly/drones/best.pt`
* Detects UAVs, drones, and flying objects in border surveillance feeds.

#### 2. **Thermal Human Detection (Night Vision)**

* Model: YOLOv8 trained on thermal datasets.
* Identifies human movement during nighttime or low visibility.

#### 3. **Suspicious Border Activity**

* Combines anomaly and motion detection on border footage.
* Detects illegal crossings, group formations, or dropped objects.

---

## ⚙️ Functional Flow of Each Pipeline

### 🔐 AI Threat Intelligence

1. User uploads email logs or network data.
2. FastAPI backend processes data → AI model inference.
3. Response sent to frontend dashboard → visual report.

### 🎦 Video Surveillance

1. Real-time or uploaded video → processed by YOLO models.
2. Bounding boxes drawn on detections (weapons, humans, activities).
3. Alerts generated on suspicious activity → stored in database.

### 🌐 Border Anomaly Detection

1. Drone footage or thermal camera input → processed by detection models.
2. Night vision detection identifies humans under low light.
3. Suspicious activity triggers alert and notifies central interface.

---

## ✨ Features

* Real-time video surveillance
* Multi-model AI threat analysis
* Night vision support (thermal mode)
* FastAPI REST endpoints for modular control
* Responsive React + Next.js dashboard
* Multi-threaded inference engine for faster predictions
* Cloud-based model management for large file handling

---

## 📈 Future Enhancements

* Add **cyber warfare intelligence** with zero-day exploit prediction
* Integrate **speech recognition** for command-based alerts
* Enhance border detection with **multi-sensor fusion (radar + vision)**
* Build a **mobile command app** for field operatives
* Include **LSTM predictive analytics** for proactive threat forecasting

---

## 👥 Contributors

| Name               | Role                         | GitHub                                 | Email                                                       |
| ------------------ | ---------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| **Usama Shahid**   | Backend Lead / AI Engineer   | [@fewgets](https://github.com/fewgets) | [shaikhusama541@gmail.com](mailto:shaikhusama541@gmail.com) |
| **Afnan**          | AI Research & Model Training | —                                      | —                                                           |
| **Team PakShield** | Research & Integration       | —                                      | —                                                           |

---

## 🤝 Collaboration & Contact

📬 **Reach Us for Collaboration:**
Interested in partnerships, defense AI research, or deployment?
Email us at: **[shaikhusama541@gmail.com](mailto:shaikhusama541@gmail.com)**

💻 **Request Training Code:**
For model reproduction or retraining requests, reach out via email or submit a GitHub issue.

---

## 🧩 License

This project is released under the **MIT License** — allowing use, modification, and distribution with attribution.

---

## 🏁 Acknowledgements

Special thanks to **URAAN Pakistan Techathon** for providing the platform to bring *Pak Shield AI* to life as part of the **SurakhshaAI Defense Challenge**.

> *Protecting borders. Preventing threats. Powering defense with intelligence.*
