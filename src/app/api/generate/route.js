import {
  generateImage,
  generateQuote,
  generateVoiceOver,
  videoConversion,
} from "@/service/generator";
import { addScript } from "@/service/scripts";
import { NextResponse } from "next/server";

const path = require("path");

export const GET = async (req) => {
  try {
    const response = await generateQuote();
    console.log(response);

    const voiceOverResponse = await generateVoiceOver(
      response.voiceOverScript,
      response.title
    );
    console.log(voiceOverResponse);

    const images = [];
    for (const [index, point] of response.points.entries()) {
      const fileName = await generateImage(point, `image${index + 1}.webp`);
      images.push(fileName);
    }

    const imagesDir = path.join(process.cwd(), "public/images");
    const inputPattern = path.join(imagesDir, "image%d.webp");

    const videoData = await videoConversion(
      images,
      inputPattern,
      response.title
    );

    if (videoData) {
      response.uploaded = false;
      addScript(response);
    }

    return NextResponse.json(
      {
        message: "Video created successfully",
        videoData,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { message: error.message, status: 500 },
      { status: 500 }
    );
  }
};
