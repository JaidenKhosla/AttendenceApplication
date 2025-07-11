from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_executor import Executor
import os
import base64
import ffmpeg
import time
import uuid
import subprocess
from model import trainBasedOnRequest, compareFaceRequest

app = Flask(__name__)
CORS(app)
executor = Executor(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def convertStringToImage(data_url: str, path: str):
    header, encoded = data_url.split(",", 1)
    img_data = base64.decode(encoded)
    
    with open(path, "wb") as file:
        file.write(img_data)

# def convertWebmToMP4(input_path: str) -> str:

#     base, _ = os.path.splitext(input_path)
#     output_path = base + '.mp4'

#     try:
#         (
#             ffmpeg
#             .input(input_path)
#             .output(output_path, vcodec='libx264', acodec='aac', strict='experimental')
#             .run(overwrite_output=True)
#         )
#         return output_path
#     except ffmpeg.Error as e:
#         print('FFmpeg error:', e.stderr.decode())
#         raise e

@app.route("/train", methods=["POST"])
def train():
    try:
        if "video" not in request.files:
            return jsonify({"message":"Bad Request"}), 400
        
        video = request.files["video"]
        name = request.form["name"]
        
        if video.filename == '':
            return jsonify({"message":"Bad Request"}), 400
        
        path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.webm")
        
        video.save(path)
        
        executor.submit(trainBasedOnRequest, name, path)
        
        return jsonify({"message":"Success"}), 200
    except Exception as e:
        return jsonify({"message" : str(e)}), 409
    
@app.route("/predict", methods=["POST"])   
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"message":"Bad Request"}), 400
        
        file = request.files["image"]
        
        path = os.path.join(UPLOAD_FOLDER, file.filename)
        
        file.save(path)
        
        req = executor.submit(compareFaceRequest, path)
        result = req.result()
        
        return jsonify({"name": result[0], "distance": result[1]}), 200
    
    except Exception as e:
        return jsonify({"message": str(e)}), 409
    
    
if __name__ == "__main__":
    app.run(debug=True)
    