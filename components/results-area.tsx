import { ImageOff } from "lucide-react";
import styles from "./results-area.module.css";
import { useEffect } from "react";

interface ResultItem {
  id: string;
  imageUrl: string;
  similarity: number;
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}

interface ResultsAreaProps {
  results: ResultItem[];
  isLoading: boolean;
}

export default function ResultsArea({ results, isLoading }: ResultsAreaProps) {
  useEffect(() => {
    if (results.length > 0) {
      console.log("First result:", {
        id: results[0].id,
        hasImageUrl: !!results[0].imageUrl,
        imageUrlLength: results[0].imageUrl?.length || 0,
        firstChars: results[0].imageUrl?.substring(0, 30) + "...",
      });
    }
  }, [results]);

  // Use the results directly without additional formatting
  return (
    <div className={styles.resultsContainer}>
      <h2 className={styles.resultsTitle}>Similar Images</h2>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Searching for similar images...</p>
        </div>
      ) : results.length > 0 ? (
        <div className={styles.resultsGrid}>
          {results.map((result) => (
            <div key={result.id} className={styles.resultCard}>
              <div className={styles.resultImageContainer}>
                <img
                  src={result.imageUrl || "/placeholder.svg"}
                  alt={result.metadata?.title || "Similar image"}
                  className={styles.resultImage}
                />
              </div>
              <div className={styles.resultInfo}>
                <h3 className={styles.resultTitle}>
                  {result.metadata?.title || "Untitled Image"}
                </h3>
                {result.metadata?.description && (
                  <p className={styles.resultDescription}>
                    {result.metadata.description}
                  </p>
                )}
                <div className={styles.similarityScore}>
                  <span className={styles.similarityLabel}>Similarity:</span>
                  <span className={styles.similarityValue}>
                    {(result.similarity * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <ImageOff className={styles.emptyIcon} />
          <p>Upload an image to see similar results</p>
        </div>
      )}
    </div>
  );
}
