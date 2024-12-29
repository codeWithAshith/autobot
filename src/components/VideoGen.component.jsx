"use client";

import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";
import LoadingComponent from "./Loading.component";
import { FaGoogleDrive } from "react-icons/fa";
import { fetchVideoFile } from "@/utils/utils";

const VideoGenComponent = () => {
  const videoRef = useRef(null);
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const setVolume = () => {
    if (videoRef.current) {
      videoRef.current.volume = 0.01;
    }
  };

  const upload = async () => {
    if (videoData) {
      const videoFile = await fetchVideoFile(videoData.url, videoData.fileName);

      if (!videoFile) {
        toast.error("Failed to get video file.");
        return;
      }

      const formData = new FormData();
      formData.append("file", videoFile);

      try {
        setIsLoading(true);
        const response = await fetch("/api/drive", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("File uploaded to Google Drive. File ID:", data.data);
        toast.success("File uploaded successfully!");
      } catch (error) {
        toast.error(error.message || "Error uploading file");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const generateVideo = async () => {
    console.log("generate -> ");
    setIsLoading(true);
    try {
      const fetchedResponse = await fetch("api/generate", {
        method: "GET",
        "content-type": "applicaiton/json",
      });

      if (!fetchedResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await fetchedResponse.json();
      console.log(responseData);

      setVideoData(responseData.videoData);
      toast.success(responseData.message);
    } catch (error) {
      console.log("catch Error", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setVolume();
  }, []);

  useEffect(() => {
    setVolume();
  }, [videoData]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 mx-4">
      <button
        className="flex bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        onClick={generateVideo}
      >
        Generate Video
      </button>

      {!isLoading && videoData && (
        <div className="flex flex-col justify-center items-center flex-grow h-full overflow-hidden gap-4">
          <video
            ref={videoRef}
            src={videoData.url}
            controls
            autoPlay
            className="max-h-[60vh]"
          />
          <button
            className="flex bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded self-center items-center"
            onClick={upload}
          >
            <span className="pr-2">Upload to</span>
            <FaGoogleDrive className="inline-block" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoGenComponent;
