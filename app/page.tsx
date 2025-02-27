"use client"

import { useState } from "react"
import UploadArea from "@/components/upload-area"
import ImagePreview from "@/components/image-preview"
import ResultsArea from "@/components/results-area"
import styles from "./page.module.css"

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const handleImageUpload = async (file: File) => {
    // Create a preview URL for the uploaded image
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    setIsSearching(true)

    // Create a FormData object to send the file to the server
    const formData = new FormData()
    formData.append("image", file)

    try {
      // Send the image to the server for processing and Pinecone search
      const response = await fetch("/api/search", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to search for similar images")
      }

      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error("Error searching for similar images:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Image Similarity Search</h1>
      <p className={styles.description}>Upload an image to find similar images from our database</p>

      <div className={styles.container}>
        <div className={styles.uploadSection}>
          <UploadArea onImageUpload={handleImageUpload} />

          {uploadedImage && <ImagePreview imageUrl={uploadedImage} />}
        </div>

        <div className={styles.resultsSection}>
          <ResultsArea results={searchResults} isLoading={isSearching} />
        </div>
      </div>
    </main>
  )
}

