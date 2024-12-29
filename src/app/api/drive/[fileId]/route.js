import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { oAuthClient, getDriveService } from "@/config/config";
import {
  fetchFileFromDrive,
  deletePublicFile,
  deleteDriveFile,
} from "@/service/drive";

export const GET = async (req, { params }) => {
  const token = await getToken({ req });
  oAuthClient.setCredentials({ access_token: token.accessToken });
  const searchParams = req.nextUrl.searchParams;
  const fileName = searchParams.get("fileName");

  try {
    const file = await fetchFileFromDrive(
      params.fileId,
      fileName,
      getDriveService(oAuthClient)
    );
    return NextResponse.json({ data: file }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message, status: error.status },
      { status: error.code }
    );
  }
};

export const DELETE = async (req, { params }) => {
  const searchParams = req.nextUrl.searchParams;
  const local = searchParams.get("local");
  const fileName = searchParams.get("fileName");

  if (local === "true") {
    await deletePublicFile(params.fileId, true);
  } else {
    await deleteDriveFile(
      params.fileId,
      getDriveService(oAuthClient),
      fileName
    );
  }

  return NextResponse.json({ data: params.fileId }, { status: 200 });
};
