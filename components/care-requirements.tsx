import styles from "./care-requirements.module.css";
import { Droplets, Sun, Thermometer, Sprout } from "lucide-react";

interface CareRequirementsProps {
  careText: string;
  isLoading: boolean;
}

export default function CareRequirements({ careText, isLoading }: CareRequirementsProps) {
  if (isLoading) {
    return (
      <div className={styles.careContainer}>
        <h2 className={styles.careTitle}>Care Requirements</h2>
        <div className={styles.loadingState}>Loading care information...</div>
      </div>
    );
  }

  if (!careText) {
    return (
      <div className={styles.careContainer}>
        <h2 className={styles.careTitle}>Care Requirements</h2>
        <div className={styles.emptyState}>
          <Sprout className={styles.careIcon} />
          <p>Upload a plant image to see care requirements</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.careContainer}>
      <h2 className={styles.careTitle}>Care Requirements</h2>
      <div className={styles.careContent}>
        <div className={styles.careIconSection}>
          <Sun className={styles.careIcon} />
          <Droplets className={styles.careIcon} />
          <Thermometer className={styles.careIcon} />
        </div>
        <div className={styles.careText}>
          {careText.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}