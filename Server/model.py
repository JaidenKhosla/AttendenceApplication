import cv2 as cv
from ultralytics import YOLO
from keras_facenet import FaceNet
import numpy as np
import pickle
import os
import tqdm

yolo = YOLO('yolov8s-face-lindevs.pt')
yolo.fuse()
videoCapture = cv.VideoCapture(0)

embedder = FaceNet()

def helper(box) -> float:
    return float(box.conf[0].cpu().numpy())

known_embeddings = pickle.load(open("embeddings.pkl", "rb")) if os.path.exists("embeddings.pkl") else {}

def trainFaceOnVideo(name: str, videoCapture: cv.VideoCapture):
    
    embeds = []
    face_crops = []
    total_frames = int(videoCapture.get(cv.CAP_PROP_FRAME_COUNT))

    cropBatchSize = 16
    
    for frames in tqdm.tqdm(range(total_frames)):
        
        isTrue, frame = videoCapture.read()
    
        if not isTrue: break
        
        if frames%3==0:
            frame = cv.cvtColor(frame, cv.COLOR_BGR2RGB)        
            if len(face_crops) >= cropBatchSize:
                embeds.extend(embedder.embeddings(face_crops))
                face_crops = []
            
            result = yolo.track(frame)
            
            if result:
                result = result[0]
                
                if result.boxes:
                    boxIDX = 0
                    face = max(result.boxes, key=helper)
                    
                    if float(face.conf[0].cpu().numpy()) >= 0.6:                    
                        x1, y1, x2, y2 = map(int, face.xyxy[0].cpu().numpy())
                        
                        croppedFace = cv.resize(cv.cvtColor(frame[y1:y2, x1:x2], cv.COLOR_BGR2RGB), (160,160))
                        face_crops.append(croppedFace)  
    
    videoCapture.release()
    
    if len(face_crops) > 0:
        embeds.extend(embedder.embeddings(face_crops))
    
    if name not in known_embeddings:
        known_embeddings[name] = []
        
    known_embeddings[name].extend(embeds)
    
    pickle.dump(known_embeddings, open("embeddings.pkl", "wb"))
    
    videoCapture.release()
    
def trainBasedOnRequest(name: str, path: str):
    trainFaceOnVideo(name, cv.VideoCapture(path))
    os.remove(path)

def compare_face(src, threshold: float) -> str:
    
    src = cv.cvtColor(cv.resize(src, (160,160)), cv.COLOR_BGR2RGB)
    
    src = embedder.embeddings([src])[0]
    
    best_fit = float('inf')
    best_name = "Unknown"

    for name, profiles in known_embeddings.items():
        embed_list = np.array(profiles)
        
        distances = np.linalg.norm(embed_list-src, axis=1)
        
        fit = np.min(distances)
        if fit < best_fit:
            best_fit = fit
            best_name = name
    
    if best_fit < threshold:
        return (best_name, float(best_fit))
    
    return "Unknown"


def compareFaceRequest(path:str) -> str:
    img = cv.imread(path)
    res = compare_face(img, 1)
    os.remove(path)
    
    return res