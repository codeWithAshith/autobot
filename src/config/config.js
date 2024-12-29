import { ChatGroq } from "@langchain/groq";
import { google } from "googleapis";

export const llama3GroqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-8b-8192",
});

export const oAuthClient = new google.auth.OAuth2();

export const getYoutubeService = (oAuthClient) =>
  google.youtube({
    version: "v3",
    auth: oAuthClient,
  });

export const getDriveService = (oAuthClient) =>
  google.drive({
    version: "v3",
    auth: oAuthClient,
  });
