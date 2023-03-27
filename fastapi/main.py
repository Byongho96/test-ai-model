from fastapi import FastAPI, UploadFile
import tensorflow as tf
from tensorflow.keras.applications.inception_v3 import InceptionV3

app = FastAPI()

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
async def analyze_object(image: UploadFile):

    print(image)
    # 이미지 천저리 
    image = tf.image.convert_image_dtype(image, tf.float32)
    image = tf.image.resize(image, [299, 299])
    image = tf.expand_dims(image, 0)
    
    # 모델 구동
    prediction = inceptionV3_model.predict(image)

    # 결과 후처리
    print(prediction)

    # 반환
    return {"message": "Hi"}
