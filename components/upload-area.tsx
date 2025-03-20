"use client"

import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
import { Upload } from "lucide-react";
import WebcamCapture from './webcam-capture';
import styles from "./upload-area.module.css"

interface UploadAreaProps {
  onImageUpload: (file: File) => void
}

export default function UploadArea({ onImageUpload }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (isValidImageFile(file)) {
        onImageUpload(file)
      } else {
        alert("Please upload a valid image file (JPEG, PNG, WebP, or GIF)")
      }
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (isValidImageFile(file)) {
        onImageUpload(file)
      } else {
        alert("Please upload a valid image file (JPEG, PNG, WebP, or GIF)")
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const isValidImageFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    return validTypes.includes(file.type)
  }

  return (
    <div>
    <div
      className={`${styles.uploadArea} ${isDragging ? styles.dragging : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={styles.fileInput}
      />

      <div className={styles.uploadContent}>
        <Upload className={styles.uploadIcon} />
        <h3 className={styles.uploadTitle}>Upload an Image</h3>
        <p className={styles.uploadDescription}>Drag and drop an image here, or click to browse</p>
        <button className={styles.uploadButton} onClick={handleButtonClick} type="button">
          Select Image
        </button>
        <p className={styles.uploadHint}>Supported formats: JPEG, PNG, WebP, GIF</p>
      </div>
          <div className={styles.webcamSection}>
        <WebcamCapture onImageCapture={onImageUpload} />
      </div>
    </div>
    </div>
  )
}

