import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

function App() {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // 비디오 재생
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, facingMode: 'user' })
      .then((stream) => {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsPlaying(true)
      })
      .catch((err) => {
        console.error('Could not access camera', err)
      })
  }, [])

  // 사진 보내기
  useEffect(() => {
    const interval = setInterval(() => {
      // canvas 엘리먼트 만들어서 동뎡사 캡쳐
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas
        .getContext('2d')
        .drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const imageFile = canvas.toDataURL('image/png')
      console.log(imageFile)

      // 캡쳐한 사진 전송
      const formData = new FormData()
      formData.append('image', imageFile)
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
      axios
        .post('http://127.0.0.1:8000/analyze/object', formData, config)
        .then((res) => {
          console.log('Image uploaded successfully.', res)
        })
        .catch((err) => {
          console.log('An error occurred: ', err)
        })
    }, 5000)

    // setInterval 삭제
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div>
      <video ref={videoRef} />
      {/* <div>
        {capturedVideos.map((capturedVideo) => (
          <video key={capturedVideo} src={capturedVideo} controls />
        ))}
      </div> */}
    </div>
  )
}

export default App
