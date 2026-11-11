from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image, UnidentifiedImageError
import io
import numpy as np

from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input,
    decode_predictions,
)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

# Loads ImageNet-pretrained weights. The first run may download weights from Keras.
model = None

def get_model():
    global model
    if model is None:
        model = MobileNetV2(weights="imagenet")
    return model

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Please choose an image first."}), 400

    file = request.files["image"]
    if not file or file.filename == "":
        return jsonify({"error": "Please choose an image first."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Upload JPG, PNG, or WEBP."}), 400

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        image = image.resize((224, 224))
        image_array = np.asarray(image, dtype=np.float32)
        image_array = np.expand_dims(image_array, axis=0)
        image_array = preprocess_input(image_array)

        predictions = get_model().predict(image_array, verbose=0)
        results = decode_predictions(predictions, top=5)[0]

        formatted = [
            {
                "label": label.replace("_", " "),
                "confidence": round(float(score) * 100, 2)
            }
            for _, label, score in results
        ]

        return jsonify({
            "success": True,
            "prediction": formatted[0],
            "results": formatted
        })
    except (UnidentifiedImageError, OSError):
        return jsonify({"error": "The uploaded file is not a valid image."}), 400
    except Exception as exc:
        app.logger.exception("Prediction failed")
        return jsonify({"error": "Classification failed. Please try again."}), 500

@app.errorhandler(413)
def too_large(_error):
    return jsonify({"error": "Image is too large. Maximum size is 10 MB."}), 413

if __name__ == "__main__":
    app.run(debug=True)
