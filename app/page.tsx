"use client";

import { useState } from "react";
import UploadArea from "@/components/upload-area";
import ImagePreview from "@/components/image-preview";
import ResultsArea from "@/components/results-area";
import CareRequirements from "@/components/care-requirements";
import styles from "./page.module.css";
import PlantChatbot from "@/components/plant-chatbot";
import { Noto_Serif } from "next/font/google";
import { Give_You_Glory } from "next/font/google";
import PlantDetail from "@/components/plant-detail";

const glory = Give_You_Glory({
  subsets: ["latin"],
  weight: ["400"], // choose the required font weights
});

const noto = Noto_Serif({
  subsets: ["latin"],
  weight: ["400"], // choose the required font weights
});

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [careRequirements, setCareRequirements] = useState("");
  const [identifiedPlant, setIdentifiedPlant] = useState("");

  const handleImageUpload = async (file: File) => {
    // Create a preview URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsSearching(true);
    setSearchResults([]);
    setCareRequirements(""); // Reset care requirements

    // Create a FormData object to send the file to the server
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Send the image to the server for processing and Pinecone search
      const response = await fetch("/api/search", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to search for similar images");
      }

      const data = await response.json();
      setSearchResults(data.results);

      // Get care requirements from first result if available
      if (data.results && data.results.length > 0) {
  setCareRequirements(data.results[0].metadata?.careRequirements || '');
  // Add this line to set the plant name:
  setIdentifiedPlant(data.results[0].metadata?.title || 'Unknown Plant');
}
    } catch (error) {
      console.error("Error searching for similar images:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={noto.className}>
      <main className={styles.main}>
        <div className={glory.className}>
          <h1 className={styles.title}>SnapStem</h1>
        </div>
        <p className={styles.description}>
          Upload an image to find similar images from our database
        </p>

        <div className={styles.container}>
          <div className={styles.pageLeft}>
            <div className={styles.uploadSection}>
              <UploadArea onImageUpload={handleImageUpload} />

              {uploadedImage && <ImagePreview imageUrl={uploadedImage} />}
            </div>
            <PlantDetail
              imageUrl={
                searchResults.length > 0
                  ? searchResults[0].imageUrl
                  : uploadedImage
              }
              plantName={identifiedPlant}
              careRequirements={careRequirements}
              isLoading={isSearching}
            />
          </div>
          <div className={styles.sidebar}>
            <PlantChatbot plantContext={identifiedPlant} />
            <div className={styles.resultsSection}>
              <ResultsArea results={searchResults} isLoading={isSearching} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
