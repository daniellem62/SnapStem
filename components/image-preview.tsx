"use client"

import { useState, useEffect } from "react"
import styles from "./image-preview.module.css"

interface ImagePreviewProps {
  imageUrl: string
}

export default function ImagePreview({ imageUrl }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reset loading state when imageUrl changes
    setLoading(true)
  }, []) // Removed unnecessary dependency: imageUrl

  return (
    <div className={styles.previewContainer}>
      <h3 className={styles.previewTitle}>Uploaded Image</h3>
      <div className={styles.imageWrapper}>
        {loading && <div className={styles.loader}></div>}
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Uploaded image"
          className={styles.previewImage}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  )
}

