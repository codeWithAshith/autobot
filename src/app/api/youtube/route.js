import * as fs from "fs";
import { join } from "path";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { oAuthClient, getYoutubeService } from "@/config/config";
import {
  getDescriptionDetail,
  getScriptByTitle,
  updateScript,
} from "@/service/scripts";

export const POST = async (req) => {
  const formData = await req.formData();
  const fileName = formData.get("fileName");

  const videoPath = join(
    process.cwd(),
    "/public",
    "/videos",
    `${fileName}.mp4`
  );

  const token = await getToken({ req });
  oAuthClient.setCredentials({ access_token: token.accessToken });

  const youtubeService = getYoutubeService(oAuthClient);
  const videoData = getScriptByTitle(fileName);

  if (videoData) {
    try {
      const response = await youtubeService.videos.insert({
        part: "snippet,status",
        requestBody: {
          snippet: {
            title: videoData.title,
            description: `${
              videoData.description
            }\n\n${getDescriptionDetail()}`,
            tags: videoData.tags,
            categoryId: 26,
            defaultLanguage: "en",
            defaultAudioLanguage: "en",
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });

      console.log("response", response);

      if (response) {
        videoData.uploaded = true;
        console.log(videoData);
      }

      updateScript(videoData);

      return NextResponse.json({ data: response.data.id }, { status: 200 });
    } catch (error) {
      console.log("error", error.errors[0]?.message);
      return NextResponse.json(
        { message: error.errors[0]?.message, status: error.status },
        { status: 403 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Missing video data", status: 404 },
      { status: 404 }
    );
  }
};

export const GET = async (req) => {
  const token = await getToken({ req });
  oAuthClient.setCredentials({ access_token: token.accessToken });

  const youtubeService = getYoutubeService(oAuthClient);

  try {
    const response = await youtubeService.channels.list({
      part: "snippet,contentDetails",
      mine: true,
    });

    const channels = response.data.items;
    console.log(channels);

    return NextResponse.json({ data: channels }, { status: 200 });
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { message: error.errors[0]?.message, status: error.status },
      { status: 403 }
    );
  }
};
