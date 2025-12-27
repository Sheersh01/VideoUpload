"use client"; 

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { useRef, useState } from "react";

interface FileUploadProps {
  onSuccess: (response: any) => void;
  onProgress: (progress: number) => void;
  fileType?:"image"|"video"
}

const FileUpload = (props: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  

  const validateFile = (file: File) => {
    if (props.fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Invalid file type. Please upload a video file.");
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
        setError("Invalid file type. Please upload a video file.");
      }
    } else {
      if (!file.type.startsWith("image/")) {
        setError("Invalid file type. Please upload a video file.");
      }
      return true;
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !validateFile(file)) return;
    setUploading(true);
    setError("");
    try {
      const response = await fetch('/api/auth/imagekit-auth')
      const data = await response.json();


      await upload({
        // Authentication parameters
        file,
        fileName: file.name, // Optionally set a custom file name
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        signature: data.signature,
        expire: data.expire,
        token: data.token,
        // Progress callback to update upload progress state
        onProgress: (event) => {
          if (event.lengthComputable && props.onProgress) {
            const progress = (event.loaded / event.total) * 100;
            setProgress(progress);
            props.onProgress(progress);
          }
        },
      });

    } catch (error) {
      setError("Failed to get upload parameters.");
      setUploading(false);
      return;
    }
    
    return <>
      <input type="file" accept={props.fileType === "video" ? "video/*" : "image/*"}
        onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
    </>;
  }
}

export default FileUpload;