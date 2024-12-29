"use client";

import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { FaGoogleDrive, FaTrash, FaYoutube } from "react-icons/fa";
import { useState, useEffect } from "react";

import LoadingComponent from "./Loading.component";
import { fetchVideoFile } from "@/utils/utils";

const VideoPreviewModal = ({
  fileId = null,
  fileName = null,
  onClose = () => {},
  deleteDriveHandler = () => {},
  deleteLocalFileHandler = () => {},
}) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (fileId) {
        try {
          await fetch(`/api/drive/${fileId}?fileName=${fileName}`);
          setVideoUrl(`/videos/${fileName}.mp4`);
        } catch (error) {
          console.error("Error fetching video URL:", error);
        }
      } else {
        setVideoUrl(`/shorts/${fileName}.mp4`);
      }
    };
    fetchVideoUrl();
  }, [fileId]);

  const postYoutubeHandler = async () => {
    const formData = new FormData();
    formData.append("fileName", fileName);

    try {
      setIsLoading(true);
      const response = await fetch("/api/youtube", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data);
      if (data.data) {
        console.log("File uploaded to Youtube. File ID:", data.data);
        toast.success("Video shared successfully!");
      }
      if (data.message) {
        console.log("File uploaded to Youtube. File ID:", data.data);
        toast.error(data.message);
      }
      onClose();
    } catch (error) {
      toast.error(error.message || "Error sharing file");
    } finally {
      setIsLoading(false);
    }
  };

  const postDriveHandler = async () => {
    const encodedVideoUrl = encodeURIComponent(`${fileName}.mp4`);
    const videoFile = await fetchVideoFile(
      `/shorts/${encodedVideoUrl}`,
      fileName
    );

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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="modal-container bg-white w-3/4 h-3/4 rounded-lg overflow-hidden relative flex flex-col">
        <div className="flex justify-between items-center px-4 pt-4">
          <p className="text-2xl text-slate-900">Share Video</p>
          <button
            onClick={onClose}
            className="text-red-500 text-xl cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        <div className="w-full h-[1px] bg-slate-600 my-2"></div>
        {isLoading && (
          <div className="flex-1">
            <LoadingComponent />
          </div>
        )}

        {!isLoading && (
          <div className="flex-grow self-center h-full overflow-hidden py-4">
            {videoUrl ? (
              <video src={videoUrl} controls className="h-full" />
            ) : (
              <div className="flex-1">
                <LoadingComponent />
              </div>
            )}
          </div>
        )}

        {fileId && (
          <div className="flex justify-between">
            <div
              onClick={() => deleteDriveHandler()}
              className="flex self-end m-4 rounded gap-4 text-red-100 bg-red-500 cursor-pointer items-center justify-end px-4 py-2"
            >
              <FaTrash /> <p>Delete</p>
            </div>
            <div
              onClick={() => postYoutubeHandler()}
              className="flex self-end m-4 rounded gap-4 text-red-500 bg-red-100 cursor-pointer items-center justify-end px-4 py-2"
            >
              <FaYoutube /> <p>Share on Youtube</p>
            </div>
          </div>
        )}

        {!fileId && fileName && (
          <div className="flex justify-between">
            <div
              onClick={() => deleteLocalFileHandler()}
              className="flex self-end m-4 rounded gap-4 text-red-100 bg-red-500 cursor-pointer items-center justify-end px-4 py-2"
            >
              <FaTrash /> <p>Delete</p>
            </div>
            <div
              onClick={() => postDriveHandler()}
              className="flex self-end m-4 rounded gap-4 text-blue-500 bg-blue-100 cursor-pointer items-center justify-end px-4 py-2"
            >
              <FaGoogleDrive /> <p>Upload to Google Drive</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreviewModal;
