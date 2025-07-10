from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_executor import Executor
import os
import base64

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


@app.route("/train", methods=["POST"])
def train():
    try:
        if "video" not in request.files:
            return "Bad Request", 400
        
        video = request.files["video"]
        name = request.json["name"]
        
        if video.filename == '':
            return "Bad Request", 400
        
        path = os.path.join(UPLOAD_FOLDER, video.filename)
        
        video.save(path)
        
        executor.submit(trainBasedOnRequest, name, path)
        
        return "Success", 200
    except Exception as e:
        return str(e), 409
    
@app.route("/predict", methods=["POST"])   
def predict():
    try:
        if "image" not in request.files:
            return "Bad Request",400
        
        file = request.files["image"]
        
        path = os.path.join(UPLOAD_FOLDER, file.filename)
        
        file.save(path)
        
        req = executor.submit(compareFaceRequest, path)
        result = req.result()
        
        return jsonify({"name": result}), 200
    
    except Exception as e:
        return str(e), 400
    
    
if __name__ == "__main__":
    app.run()
    