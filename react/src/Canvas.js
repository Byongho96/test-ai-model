import React, { useRef, useEffect, useState } from 'react'
import axios from 'axios'

export default function Canvas() {
  // canvas
  const cavasContainerRef = useRef()
  const canvasBoardRef = useRef()
  const colorPickRefs = useRef([])
  const resetRef = useRef()

  const [canvasResult, setCanvasResult] = useState('')

  // r 보내기
  useEffect(() => {
    const interval = setInterval(() => {
      // canvas 엘리먼트 만들어서 동뎡사 캡쳐
      const canvas = canvasBoardRef.current
      const imageUrl = canvas.toDataURL('image/jpeg', 1.0)
      const data = {
        image_url: imageUrl,
      }
      axios
        .post('http://127.0.0.1:8000/analyze/doodle', data)
        .then((res) => {
          console.log('Drawing uploaded successfully.', res)
          setCanvasResult(res.data.result)
        })
        .catch((err) => {
          console.log('An error occurred: ', err)
        })
    }, 1000)

    // setInterval 삭제
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let dataChannel
    let context
    let painting = false
    let pickedColor = '#000000'
    let lineWidth = 3

    // 그림판 생성
    const makeCanvas = () => {
      context = canvasBoardRef.current.getContext('2d')
      context.lineCap = 'round'

      // 화면에 맞춰서 생성
      canvasBoardRef.current.width = cavasContainerRef.current.clientWidth
      canvasBoardRef.current.height = cavasContainerRef.current.clientHeight

      if (!canvasBoardRef.current) return
      if (!context) return

      // mouse event
      canvasBoardRef.current.addEventListener('mousedown', readyPainting)
      canvasBoardRef.current.addEventListener('mousemove', beginPainting)
      canvasBoardRef.current.addEventListener('mouseup', stopPainting)
      canvasBoardRef.current.addEventListener('mouseout', stopPainting)

      // touch event
      canvasBoardRef.current.addEventListener('touchstart', readyPainting)
      canvasBoardRef.current.addEventListener('touchmove', beginPainting)
      canvasBoardRef.current.addEventListener('touchend', stopPainting)

      // 색 바꿔주기
      if (colorPickRefs.current) {
        colorPickRefs.current.map((element) =>
          element.addEventListener('click', (e) => {
            lineWidth = 3
            if (e.target) {
              pickedColor = e.target.id
            }
          })
        )
      }

      // 화면 재구성
      if (resetRef.current) {
        resetRef.current.onclick = () => {
          context.clearRect(
            0,
            0,
            canvasBoardRef.current.width,
            canvasBoardRef.current.height
          )
        }
      }
    }

    // 그림그리기
    function readyPainting(e) {
      e.preventDefault()
      const mousePos = getMosuePositionOnCanvas(e)
      context.beginPath() // 색깔 변경시 기존 선 색상 유지
      context.moveTo(mousePos.x, mousePos.y)
      context.lineWidth = lineWidth
      context.strokeStyle = pickedColor
      painting = true
    }

    function beginPainting(e) {
      e.preventDefault()
      if (painting) {
        const mousePos = getMosuePositionOnCanvas(e)
        context.lineTo(mousePos.x, mousePos.y)
        context.stroke()
        const data = {
          x: mousePos.x,
          y: mousePos.y,
          lineWidth,
          color: pickedColor,
          painting: true,
        }
        if (dataChannel) {
          dataChannel.send(
            JSON.stringify({ type: 'begin', payload: { ...data } })
          )
        }
      }
    }

    // 그림 멈추기
    function stopPainting(e) {
      e.preventDefault()
      if (painting) {
        context.stroke()
      }
      painting = false
    }

    // 마우스 위치 잡아주기
    function getMosuePositionOnCanvas(e) {
      if (e.touches) {
        return {
          x: e.touches[0].clientX - e.target.parentNode.offsetLeft,
          y: e.touches[0].clientY - e.target.parentNode.offsetHeight + 25,
        }
      }
      return { x: e.offsetX, y: e.offsetY }
    }

    makeCanvas()
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <div
        ref={cavasContainerRef}
        style={{ position: 'relative', width: '600px', height: '400px' }}
      >
        <canvas
          ref={canvasBoardRef}
          style={{ border: '1px solid', width: '100%', height: '100%' }}
        ></canvas>
        <div
          ref={resetRef}
          style={{ position: 'absolute', bottom: 0, right: 0 }}
        >
          지우개
        </div>
      </div>
      <div>{canvasResult}</div>
    </div>
  )
}
