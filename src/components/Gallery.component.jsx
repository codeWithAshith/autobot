"use client";

import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

import UploadComponent from "./Upload.component";
import LoadingComponent from "./Loading.component";
import VideoPreviewModal from "@/components/VideoPreview.modal";
import { FaPhotoVideo } from "react-icons/fa";

const GalleryComponent = () => {
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drive");
      const jsonResponse = await response.json();
      if (!response.ok) {
        toast.error(jsonResponse.message);
        if (response.status === 401) {
          signOut({ callbackUrl: "/login" });
        }
      } else {
        console.log(jsonResponse?.data);
        try {
          const response = await fetch("/api/scripts");
          const result = await response.json();
          const scripts = result.data;

          if (response.ok) {
            const driveFiles = [];
            const lFiles = [];
            const files = jsonResponse?.data || [];

            files.forEach((file) => {
              const script = scripts.find(
                (script) => script.title === file.name.replace(".mp4", "")
              );
              if (script) {
                file.uploaded = script.uploaded;
                driveFiles.push(file);
              }
            });

            scripts.forEach((script) => {
              const fileExists = files.some(
                (file) => file.name.replace(".mp4", "") === script.title
              );
              if (!fileExists) {
                lFiles.push(script);
              }
            });

            if (jsonResponse) {
              setFiles(driveFiles.filter((file) => !file.deleteFlag));
              setLocalFiles(lFiles.filter((file) => !file.deleteFlag));
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      toast.error(error.message || "Error fetching files");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDriveHandler = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/drive/${selectedVideoId}?fileName=${fileName}`,
        {
          method: "DELETE",
        }
      );
      console.log(response);
      console.log(selectedVideoId);

      await response.json();
      dialogCloseHandler();
    } catch (error) {
      toast.error(error.message || "Error deleting file");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLocalFileHandler = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/drive/${fileName}?local=true`, {
        method: "DELETE",
      });
      await response.json();
      dialogCloseHandler();
    } catch (error) {
      toast.error(error.message || "Error deleting file");
    } finally {
      setIsLoading(false);
    }
  };

  const dialogCloseHandler = () => {
    setFileName(null);
    setSelectedVideoId(null);
    setIsPreviewDialogOpen(false);
    fetchFiles();
  };

  useEffect(() => {
    if (!isUploadDialogOpen) {
      fetchFiles();
    }
  }, [isUploadDialogOpen]);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <div className="h-full w-full bg-white p-4 rounded shadow select-none">
      <div className="grid grid-rows-2 w-full h-full">
        <div className="flex flex-col w-full h-full overflow-hidden">
          <div className="flex justify-between mb-4 border-b border-slate-200 pb-4">
            <p className="text-xl text-slate-900">Google Drive</p>
            <button className="btn" onClick={() => setIsUploadDialogOpen(true)}>
              Add
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 overflow-y-auto">
            {files && files.length > 0 ? (
              files.map((file) => (
                <div
                  key={file.id}
                  className={`border ${
                    file.uploaded === true
                      ? "border-green-100 bg-green-100"
                      : "border-gray-300"
                  } p-2 flex justify-between items-center`}
                >
                  <span className="line-clamp-1 select-none" title={file.name}>
                    {file.name}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedVideoId(file.id);
                      setFileName(
                        files
                          .find((f) => f.id === file.id)
                          ?.name.replace(".mp4", "")
                      );
                      setIsPreviewDialogOpen(true);
                    }}
                    className="mt-2 py-2 px-4 rounded"
                  >
                    <FaPhotoVideo />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-lg text-gray-500">No data</p>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full h-full overflow-hidden">
          <p className="text-xl text-slate-900 my-4 border-b border-slate-200 pb-4">
            Local Files
          </p>
          <div className="grid grid-cols-4 gap-4 overflow-y-auto">
            {localFiles && localFiles.length > 0 ? (
              localFiles.map((file, index) => (
                <div
                  key={index}
                  className={`border ${
                    file.uploaded === true
                      ? "border-green-100 bg-green-100"
                      : "border-gray-300"
                  } p-2 flex justify-between items-center`}
                >
                  <span className="line-clamp-1 select-none" title={file.name}>
                    {file.title}
                  </span>
                  <button
                    onClick={() => {
                      setFileName(file.title);
                      setIsPreviewDialogOpen(true);
                    }}
                    className="mt-2 py-2 px-4 rounded"
                  >
                    <FaPhotoVideo />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-lg text-gray-500">No data</p>
            )}
          </div>
        </div>
      </div>

      {isUploadDialogOpen && (
        <UploadComponent onClose={() => setIsUploadDialogOpen(false)} />
      )}

      {isPreviewDialogOpen && (
        <VideoPreviewModal
          fileName={fileName}
          fileId={selectedVideoId}
          onClose={() => dialogCloseHandler()}
          deleteDriveHandler={() => deleteDriveHandler()}
          deleteLocalFileHandler={() => deleteLocalFileHandler()}
        />
      )}
    </div>
  );
};

export default GalleryComponent;
