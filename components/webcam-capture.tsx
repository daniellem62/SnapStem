import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import styles from './webcam-capture.module.css';

interface WebcamCaptureProps {
  onImageCapture: (file: File) => void;
}

const WebcamCapture = ({ onImageCapture }: WebcamCaptureProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(
    null
  );

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, []);

  const confirmImage = useCallback(() => {
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'webcam-capture.png', {
            type: 'image/png',
          });
          onImageCapture(file);
          setIsWebcamOpen(false);
          setCapturedImage(null);
        });
    }
  }, [capturedImage, onImageCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  if (!isWebcamOpen) {
    return (
      <button
        onClick={() => setIsWebcamOpen(true)}
        className={styles.openCameraButton}
      >
        Take Photo with Camera
      </button>
    );
  }

  return (
    <div className={styles.webcamContainer}>
      {!capturedImage ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={{
              width: 720,
              height: 720,
              facingMode: 'environment',
            }}
            className={styles.webcam}
          />
          <div className={styles.buttonContainer}>
            <button
              onClick={capture}
              className={styles.captureButton}
            >
              Take Photo
            </button>
            <button
              onClick={() => setIsWebcamOpen(false)}
              className={styles.closeButton}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className={styles.previewContainer}>
          <img
            src={capturedImage}
            alt="Captured"
            className={styles.preview}
          />
          <div className={styles.buttonContainer}>
            <button
              onClick={confirmImage}
              className={styles.confirmButton}
            >
              Use Photo
            </button>
            <button
              onClick={retakePhoto}
              className={styles.retakeButton}
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
