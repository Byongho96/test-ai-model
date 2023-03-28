from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import tensorflow as tf
from tensorflow.keras.applications.inception_v3 import InceptionV3
import io
import cv2
import PIL
import base64
import numpy as np

from classes.inceptionV3 import ref as inceptionV3_ref

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Image(BaseModel):
    image_url: str

inceptionV3_model = tf.keras.applications.InceptionV3(
        include_top=True,
        weights="imagenet",
        input_tensor=None,
        input_shape=None,
        pooling=None,
        classes=1000,
        classifier_activation="softmax",
    )

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post('/analyze/object')
async def analyze_object(image: Image):

    # 데이터 URL에서 Base64 인코딩된 이미지 데이터를 추출합니다.
    image_b64 = image.image_url.split(",")[1]
    # Base64 디코딩을 수행합니다.
    image_data = base64.b64decode(image_b64)
    # 이미지 데이터를 PIL.Image 객체로 변환합니다.
    image_load = PIL.Image.open(io.BytesIO(image_data))
    # 이미지를 NumPy 배열로 변환합니다.
    image = np.array(image_load)

    # 이미지 천저리 
    image = tf.image.convert_image_dtype(image, tf.float32)
    image = tf.image.resize(image, [299, 299])
    image = tf.expand_dims(image, 0)
    
    # 모델 구동
    prediction = inceptionV3_model.predict(image)[0]

    # 결과 후처리
    idx = prediction.argmax()
    result = inceptionV3_ref[idx]

    # 반환
    return {"result": result}

@app.post('/analyze/object2')
async def analyze_object(image: Image):
    
    # 데이터 URL에서 Base64 인코딩된 이미지 데이터를 추출합니다.
    image_b64 = image.image_url.split(",")[1]
    # Base64 디코딩을 수행합니다.
    image_data = base64.b64decode(image_b64)
    # 이미지 데이터를 PIL.Image 객체로 변환합니다.
    image_load= PIL.Image.open(io.BytesIO(image_data))
    # 이미지를 NumPy 배열로 변환합니다.
    image = np.array(image_load)

    # Yolo 로드
    # https://pjreddie.com/darknet/yolo/
    net = cv2.dnn.readNet("classes/yolov3.weights", "classes/yolov3.cfg") # weights, cfg파일을 불러와서 yolo의 네트워크와 연결한다. 
    classes = [] #class 배열 만들기
    with open("classes/coco.names", "r") as f: # coco 파일을 읽어온다. 
        classes = [line.strip() for line in f.readlines()]  # 읽어온 coco 파일을 whitespace(공백라인)를 제거하여 classes 배열 안에 넣는다.

    layer_names = net.getLayerNames() # 네트워크의 모든 레이어 이름을 가져와서 layer_names에 넣는다.
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()] 


    # # 이미지 가져오기
    # image = cv2.imread(image) # opencv를 통해 이미지를 가져온다.
    image = cv2.resize(image, None, fx=0.4, fy=0.4) # 이미지 크기를 재설정한다. 

    # 물체 감지
    blob = cv2.dnn.blobFromImage(image, 0.00392, (416, 416), (0, 0, 0), True, crop=False) # 이미지를 blob 객체로 처리한다.
    net.setInput(blob) # blob 객체에 setInput 함수를 적용한다. 
    outs = net.forward(output_layers) #output_layers를 네트워크 순방향으로 실행(추론)한다.

    class_ids = []  # 인식한 사물 클래스 아이디를 넣는 배열
    confidences = [] # 0에서 1까지 사물 인식에 대한 신뢰도를 넣는 배열
    for out in outs:
        for detection in out:
            scores = detection[5:] #
            class_id = np.argmax(scores) # scores 중에서 최대값을 색인하여 class_id에 넣는다.
            confidence = scores[class_id] # scores 중에서 class_id에 해당하는 값을 confidence에 넣는다.
            if confidence > 0.5:
                confidences.append(float(confidence))
                class_ids.append(class_id)

    result = []
    for i in range(len(class_ids)): 
        label = str(classes[class_ids[i]]) # 클래스 아이디 지정해둔 것을 label변수에 저장
        if label == 'person':
            continue
        result.append(label)
    # 반환
    return {"result": result}

@app.post('/analyze/doodle')
async def analyze_object(image: Image):

    # 데이터 URL에서 Base64 인코딩된 이미지 데이터를 추출합니다.
    image_b64 = image.image_url.split(",")[1]
    # Base64 디코딩을 수행합니다.
    image_data = base64.b64decode(image_b64)
    # 이미지 데이터를 PIL.Image 객체로 변환합니다.
    image_load = PIL.Image.open(io.BytesIO(image_data))
    # 이미지를 NumPy 배열로 변환합니다.
    image = np.array(image_load)

    # 이미지 천저리 
    image = tf.image.convert_image_dtype(image, tf.float32)
    image = tf.image.resize(image, [299, 299])
    image = tf.expand_dims(image, 0)
    
    # 모델 구동
    prediction = inceptionV3_model.predict(image)[0]

    # 결과 후처리
    idx = prediction.argmax()
    result = inceptionV3_ref[idx]

    # # 반환
    return {"result": result}
