import { useState, useEffect } from "react";
import { 
  Sun, 
  Droplets, 
  Sprout, 
  Thermometer, 
  Wind, 
  Mountain, 
  AlertTriangle 
} from "lucide-react";
import styles from "./plant-detail.module.css";

interface PlantDetailProps {
  imageUrl: string | null;
  plantName: string;
  careRequirements: string;
  isLoading: boolean;
}

export default function PlantDetail({ 
  imageUrl, 
  plantName, 
  careRequirements,
  isLoading 
}: PlantDetailProps) {
  const [parsedCareRequirements, setParsedCareRequirements] = useState<{
    light: string;
    water: string;
    soil: string;
    temperature: string;
    humidity: string;
    other: string[];
  }>({
    light: "",
    water: "",
    soil: "",
    temperature: "",
    humidity: "",
    other: [],
  });

  useEffect(() => {
    if (careRequirements) {
      // Parse care requirements text
      const requirements = {
        light: "",
        water: "",
        soil: "",
        temperature: "",
        humidity: "",
        other: [] as string[],
      };

      // Extract information based on keywords
      const lines = careRequirements.split(/\n|\./).filter(line => line.trim() !== "");
      
      lines.forEach(line => {
        const lowerLine = line.toLowerCase().trim();
        
        if (lowerLine.includes("light") || lowerLine.includes("sun")) {
          requirements.light = line.trim();
        } else if (lowerLine.includes("water")) {
          requirements.water = line.trim();
        } else if (lowerLine.includes("soil") || lowerLine.includes("potting")) {
          requirements.soil = line.trim();
        } else if (lowerLine.includes("temp") || lowerLine.includes("°")) {
          requirements.temperature = line.trim();
        } else if (lowerLine.includes("humid")) {
          requirements.humidity = line.trim();
        } else if (lowerLine.length > 10) {
          requirements.other.push(line.trim());
        }
      });

      setParsedCareRequirements(requirements);
    }
  }, [careRequirements]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Analyzing your plant...</p>
        </div>
      </div>
    );
  }

  if (!imageUrl || !plantName) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Sprout size={48} />
          <p>Upload a plant image to see detailed information</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt={plantName} className={styles.plantImage} />
        </div>
        <div className={styles.titleContainer}>
          <h2 className={styles.plantName}>{plantName}</h2>
        </div>
      </div>

      <div className={styles.careContainer}>
        <h3 className={styles.careTitle}>Care Requirements</h3>
        
        <div className={styles.careGrid}>
          {parsedCareRequirements.light && (
            <div className={styles.careItem}>
              <div className={styles.careIconWrapper}>
                <Sun className={styles.careIcon} />
              </div>
              <div className={styles.careText}>
                <h4>Light</h4>
                <p>{parsedCareRequirements.light}</p>
              </div>
            </div>
          )}
          
          {parsedCareRequirements.water && (
            <div className={styles.careItem}>
              <div className={styles.careIconWrapper}>
                <Droplets className={styles.careIcon} />
              </div>
              <div className={styles.careText}>
                <h4>Water</h4>
                <p>{parsedCareRequirements.water}</p>
              </div>
            </div>
          )}
          
          {parsedCareRequirements.soil && (
            <div className={styles.careItem}>
              <div className={styles.careIconWrapper}>
                <Mountain className={styles.careIcon} />
              </div>
              <div className={styles.careText}>
                <h4>Soil</h4>
                <p>{parsedCareRequirements.soil}</p>
              </div>
            </div>
          )}
          
          {parsedCareRequirements.temperature && (
            <div className={styles.careItem}>
              <div className={styles.careIconWrapper}>
                <Thermometer className={styles.careIcon} />
              </div>
              <div className={styles.careText}>
                <h4>Temperature</h4>
                <p>{parsedCareRequirements.temperature}</p>
              </div>
            </div>
          )}
          
          {parsedCareRequirements.humidity && (
            <div className={styles.careItem}>
              <div className={styles.careIconWrapper}>
                <Wind className={styles.careIcon} />
              </div>
              <div className={styles.careText}>
                <h4>Humidity</h4>
                <p>{parsedCareRequirements.humidity}</p>
              </div>
            </div>
          )}
        </div>
        
        {parsedCareRequirements.other.length > 0 && (
          <div className={styles.additionalCare}>
            <h4>Additional Care Tips</h4>
            <ul>
              {parsedCareRequirements.other.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}