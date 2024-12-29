import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { deleteVideos, getAllVideos, uploadFileToDrive } from "@/service/drive";
import { oAuthClient, getDriveService } from "@/config/config";

export const POST = async (req) => {
  const formData = await req.formData();
  const file = formData.get("file");
  const token = await getToken({ req });
  oAuthClient.setCredentials({ access_token: token?.accessToken });

  try {
    return NextResponse.json(
      { data: await uploadFileToDrive(file, getDriveService(oAuthClient)) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message, status: error.status },
      { status: error.code }
    );
  }
};

export const GET = async (req) => {
  const token = await getToken({ req });
  oAuthClient.setCredentials({ access_token: token?.accessToken });

  await deleteVideos();

  try {
    return NextResponse.json(
      { data: await getAllVideos(getDriveService(oAuthClient)) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message, status: error.status },
      { status: error.code }
    );
  }
};
