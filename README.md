# VisionAI — Image Classification Website

A beginner-friendly image classification web app:
- Frontend: HTML, CSS, JavaScript
- Backend: Python + Flask
- Model: Keras MobileNetV2 pretrained on ImageNet
- Shows the top 5 predicted labels and confidence scores

## 1. Requirements
- Python 3.10–3.12 recommended
- VS Code
- Internet connection for the first model run (Keras downloads pretrained weights)

## 2. Open the project
Open this folder in VS Code and open its terminal.

## 3. Create and activate a virtual environment

**Windows PowerShell:**
```powershell
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.venv\Scripts\Activate.ps1
```

**Windows CMD:**
```bat
py -3.11 -m venv .venv
.venv\Scripts\activate.bat
```

## 4. Install packages
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

TensorFlow can be a large installation. Use a supported Python version (3.10–3.12) if installation fails.

## 5. Run the website
```bash
python app.py
```
Open the local address shown in the terminal, usually:
http://127.0.0.1:5000

The first classification can take longer because MobileNetV2 may download its ImageNet weights. Keep the terminal running while using the website. Press Ctrl+C to stop Flask.

## How it works
1. JavaScript sends the selected image to `/predict`.
2. Flask reads and resizes it to 224×224.
3. Keras MobileNetV2 preprocesses the image and predicts ImageNet classes.
4. The backend decodes the top 5 predictions and returns JSON.
5. JavaScript displays the labels and confidence percentages.

## Important limitations
- This is a general-purpose ImageNet classifier with 1,000 known categories, not a model that can recognize literally every object.
- It predicts the closest ImageNet labels; it does not learn from your uploaded images.
- The confidence score is a model score, not a guarantee that the prediction is correct.
- This starter app is intended for local learning/development. Add production security, upload limits, rate limiting, and deployment configuration before public hosting.
