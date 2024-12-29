import * as fs from "fs";
import { join, resolve } from "path";
import fetch from "node-fetch";
import { writeFile } from "fs/promises";
import { errorHandler } from "../utils/utils";
import { deleteScriptByTitle, softDelete } from "./scripts";

export const uploadFileToDrive = async (file, driveService) => {
  console.log("file ====> ", file);

  const bytes = await file.arrayBuffer();
  const filePath = join(process.cwd(), "/public", "/videos", file.name);
  await writeFile(filePath, Buffer.from(bytes));
  const fileStream = fs.createReadStream(filePath);

  try {
    const folderResponse = await driveService.files.list({
      pageSize: 1,
      q: "name='autobot' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    });

    let autobotFolderId;
    if (folderResponse.data.files.length === 0) {
      const folderMetadata = {
        name: "autobot",
        mimeType: "application/vnd.google-apps.folder",
      };
      const createFolderResponse = await driveService.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });
      autobotFolderId = createFolderResponse.data.id;
    } else {
      autobotFolderId = folderResponse.data.files[0].id;
    }

    console.log("autobotFolderId", autobotFolderId);

    const response = await driveService.files.create({
      requestBody: {
        name: file.name,
        parents: [autobotFolderId],
      },
      media: {
        mimeType: file.type,
        body: fileStream,
      },
      fields: "id",
    });

    console.log("response", response.data);

    // Set file permissions
    await driveService.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    deletePublicFile(file.name.replace(".mp4", ""));

    return response?.data?.id;
  } catch (error) {
    console.log(error);
    throw errorHandler(error);
  }
};

export const getAllVideos = async (driveService) => {
  try {
    const folderResponse = await driveService.files.list({
      pageSize: 1,
      q: "name='autobot' and mimeType='application/vnd.google-apps.folder' and trashed=false",
    });

    let autobotFolderId;
    if (folderResponse.data.files.length === 0) {
      const folderMetadata = {
        name: "autobot",
        mimeType: "application/vnd.google-apps.folder",
      };
      const createFolderResponse = await driveService.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });
      autobotFolderId = createFolderResponse.data.id;
    } else {
      autobotFolderId = folderResponse.data.files[0].id;
    }

    const filesResponse = await driveService.files.list({
      pageSize: 150,
      q: `'${autobotFolderId}' in parents and trashed=false`,
    });

    return filesResponse?.data?.files;
  } catch (error) {
    throw errorHandler(error);
  }
};

export const fetchFileFromDrive = async (fileId, fName, driveService) => {
  try {
    const response = await driveService.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink, id, name",
    });

    const videoResponse = await fetch(response.data.webContentLink, {
      cache: "no-store",
    });

    const fileArrayBuffer = await videoResponse.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const fileName = `${fName}.mp4`;
    const filePath = join(process.cwd(), "/public", "/videos", fileName);

    await writeFile(filePath, fileBuffer);

    return response.data;
  } catch (error) {
    throw errorHandler(error);
  }
};

export const deleteVideos = async () => {
  const videosFolderPath = join(process.cwd(), "/public", "/videos");

  try {
    const files = fs.readdirSync(videosFolderPath);
    files.forEach((file) => {
      const filePath = join(videosFolderPath, file);
      fs.unlinkSync(filePath);
    });

    console.log("All files deleted from /public/videos folder");
    return new Promise((resolve) => resolve(true));
  } catch (error) {
    console.error("Error deleting files:", error);
    return new Promise((reject) => reject(error));
  }
};

export const deletePublicFile = async (title, isScript = false) => {
  const fileName = `${title}.mp4`;
  const filePath = join(process.cwd(), "/public", "/shorts", fileName);

  const audioFileName = `${title}.mp3`;
  const audioFilePath = join(
    process.cwd(),
    "/public",
    "/voiceOver",
    audioFileName
  );

  if (isScript) deleteScriptByTitle(title);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted video file: ${fileName}`);
  } else {
    console.log(`Video file not found: ${fileName}`);
  }

  if (fs.existsSync(audioFilePath)) {
    fs.unlinkSync(audioFilePath);
    console.log(`Deleted audio file: ${audioFileName}`);
  } else {
    console.log(`Audio file not found: ${audioFileName}`);
  }
};

export const deleteDriveFile = async (fileId, driveService, fName) => {
  console.log("fileId", fileId);

  const fileName = `${fName}.mp4`;
  const filePath = join(process.cwd(), "/public", "/videos", fileName);
  fs.unlinkSync(filePath);

  try {
    await driveService.files.delete({
      fileId: fileId,
    });

    console.log(`File with ID ${fileId} has been successfully deleted.`);

    softDelete(fName);

    return {
      success: true,
      message: `File with ID ${fileId} deleted successfully.`,
    };
  } catch (error) {
    throw errorHandler(error);
  }
};
