import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Canvas from './Canvas'

function App() {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoResult, setVideoResult] = useState('')

  // // 비디오 재생
  // useEffect(() => {
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true, facingMode: 'user' })
  //     .then((stream) => {
  //       videoRef.current.srcObject = stream
  //       videoRef.current.play()
  //       setIsPlaying(true)
  //     })
  //     .catch((err) => {
  //       console.error('Could not access camera', err)
  //     })
  // }, [])

  // // 사진 보내기
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // canvas 엘리먼트 만들어서 동뎡사 캡쳐
  //     const canvas = document.createElement('canvas')
  //     canvas.width = videoRef.current.videoWidth
  //     canvas.height = videoRef.current.videoHeight
  //     canvas
  //       .getContext('2d')
  //       .drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
  //     const imageUrl = canvas.toDataURL('image/jpeg', 1.0)
  //     const data = {
  //       image_url: imageUrl,
  //     }
  //     axios
  //       .post('http://127.0.0.1:8000/analyze/object2', data)
  //       .then((res) => {
  //         console.log('Image uploaded successfully.', res)
  //         setVideoResult(res.data.result)
  //       })
  //       .catch((err) => {
  //         console.log('An error occurred: ', err)
  //       })
  //   }, 1000)

  //   // setInterval 삭제
  //   return () => clearInterval(interval)
  // }, [isPlaying])

  return (
    <>
      <div style={{ display: 'flex' }}>
        <video ref={videoRef} />
        <div>{videoResult}</div>
      </div>
      <Canvas />
    </>
  )
}

export default App
