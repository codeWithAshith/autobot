"use client";

import toast from "react-hot-toast";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useDropzone } from "react-dropzone";

import LoadingComponent from "./Loading.component";

const UploadComponent = ({ onClose }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    } else {
      console.log("Please upload only video files.");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [],
    },
    maxFiles: 1,
    multiple: false,
  });

  const postHandler = async () => {
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
      onClose();
    } catch (error) {
      toast.error(error.message || "Error uploading file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="modal-container bg-white w-3/4 h-3/4 rounded-lg overflow-hidden relative flex flex-col p-2">
        <div className="flex justify-between items-center px-4 pt-4">
          <p className="text-2xl text-slate-900">Add Video</p>
          <button
            onClick={onClose}
            className="text-red-500 text-xl cursor-pointer"
          >
            <IoMdClose />
          </button>
        </div>
        {isLoading && (
          <div className="flex-1">
            <LoadingComponent />
          </div>
        )}
        {!isLoading && (
          <div className="h-full flex flex-col gap-2 items-center justify-center border border-dotted border-slate-900 rounded p-4 m-4 overflow-hidden">
            <div
              {...getRootProps({ className: "dropzone" })}
              className="self-center"
            >
              <input {...getInputProps()} />
              <p className="text-sm">
                Drag & drop some files here, or click to select files
              </p>
            </div>
            {videoPreview && (
              <video className="h-full" src={videoPreview} controls />
            )}
          </div>
        )}

        <div className="flex justify-end items-center mr-4 mb-4">
          <button className="btn" onClick={postHandler}>
            Upload to Google Drive
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
