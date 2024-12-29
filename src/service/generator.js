import { z } from "zod";
import { llama3GroqModel } from "@/config/config";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getScriptTitles } from "./scripts";

const { exec } = require("child_process");

const fs = require("fs");
const path = require("path");
// const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const ffmpeg = require("fluent-ffmpeg");

const GratitudeSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  points: z.array(z.string()),
  voiceOverScript: z.string(),
});

const isLocalEnvironment = () => {
  return !process.env.VERCEL;
};

export const generateQuote = async () => {
  const scriptTitles = getScriptTitles();
  const template = `You are an expert in creating content for youtube shorts with over 30 years on experience.
    
    Create me one fact in the same style as the below examples, and format them in a JSON with

    title: string
    description: string 
    tags: Array of strings
    points: Array of strings ( 3 points with less than 10 words each)
    voiceOverScript: string (a single script which should narrate its corresponding point in a natural, conversational, and engaging way. If the total voice-over script is 30 seconds, it should be designed for **3 points** with **10 seconds per point**.)

    Do not repeat any points.

    These should be points about health, wellness, mindfulness, relationships, exercise, sleep, happiness.

    Ensure that the generated content is **unique** and does not repeat any titles or content similar to the following existing titles: 
    ${scriptTitles.join(", ")}

    The voice-over script should be conversational and feel like you're talking directly to the viewer, drawing them in to listen. 
    Feel free to add dramatic pauses, emphasize certain words, and make it sound engaging and easy to follow.

    They'll be formatted as a json. Keep the points/facts/advice engaging, polarizing, over the top and relatable to everyone or people in particular situations. 
    The reading grade should be under grade 7 ideally. Each point should be very short & concise.

     The JSON should be directly related to this topic and keep the content simple and engaging.
`;

  const noInputPrompt = ChatPromptTemplate.fromMessages([["system", template]]);
  console.log("Loading Chain...");

  let result;
  try {
    const structuredLlm = llama3GroqModel.withStructuredOutput(GratitudeSchema);
    const chain = noInputPrompt.pipe(structuredLlm);
    result = await chain.invoke({ titles: scriptTitles });

    return new Promise((resolve) => resolve(result));
  } catch (error) {
    return new Promise((reject) => reject(error));
  }
};

export const generateImage = async (point, fileName) => {
  try {
    let browser;

    if (isLocalEnvironment()) {
      console.log("Running in Local Environment");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      console.log("Running in Vercel Environment (Production)");
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    }

    // const browser = await puppeteer.launch({
    //   headless: false,
    //   defaultViewport: null,
    // });

    // const browser = await puppeteer.launch({
    //   args: chromium.args,
    //   executablePath: await chromium.executablePath,
    //   headless: chromium.headless,
    // });

    const page = await browser.newPage();
    await page.goto("https://replicate.com", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    await page.waitForSelector("div.flex.flex-wrap.gap-4 button");
    await page.evaluate(() => {
      const buttons = document.querySelectorAll(
        "div.flex.flex-wrap.gap-4 button"
      );
      if (buttons.length > 0) {
        buttons[0].scrollIntoView();
        buttons[0].click();
      }
    });

    await page.waitForSelector("button#model-bytedance-sdxl-lightning-4step");
    await page.click("button#model-bytedance-sdxl-lightning-4step");

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.waitForSelector('input[name="prompt"]');
    await page.evaluate(() => {
      const input = document.querySelector('input[name="prompt"]');
      input.value = "";
    });

    const prompts = [
      "A confident South Indian woman with dark, lustrous hair styled in a traditional braid, wearing a vibrant silk saree with golden borders. She is sitting cross-legged in a serene natural setting, holding a cup of coffee, her expression calm and empathetic, gazing slightly to the side. The environment is softly lit by a golden sunset, emphasizing her warm and welcoming demeanor. - ",
      "A modern South Indian woman with glowing dusky skin and expressive almond-shaped eyes, wearing a casual yet stylish kurti and jeans. She is leaning on a wooden table in a cozy café, headphones on her neck, her eyes focused as if attentively listening. A warm glow from fairy lights surrounds the café’s rustic decor. - ",
      "A poised South Indian woman in a white and gold kasavu saree, sitting on a balcony with green potted plants around. She is barefoot, her posture relaxed, and her hands resting lightly on her lap, reflecting serenity. Her face carries a gentle smile as if she’s silently acknowledging someone’s story. - ",
      "A South Indian woman with wavy shoulder-length hair, wearing a maroon salwar kameez, seated on a wooden bench near a calm riverbank. Her body language is open, with one hand resting on her knee, and her eyes softly meeting the viewer's gaze as if silently encouraging openness and understanding. - ",
      "A charismatic South Indian woman with sharp features, wearing a casual cotton saree in earthy tones, sitting on a wicker chair under a tree. She is holding a pen and a journal, looking up as if attentively listening to someone. Dappled sunlight filters through the leaves, creating a warm, intimate atmosphere. - ",
    ];
    const randomIndex = Math.floor(Math.random() * prompts.length);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.type(
      'input[name="prompt"]',
      `${prompts[randomIndex]} '${point}'`
    );

    await page.waitForSelector('button[type="submit"]');
    await page.click('button[type="submit"]');

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await page.waitForSelector('img[alt="Output"]', { timeout: 50000 });

    await page.waitForSelector('img[alt="Output"]');

    const imageUrl = await page.evaluate(() => {
      return document.querySelector('img[alt="Output"]').src;
    });

    const dirPath = path.join(process.cwd(), "public/images");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const imagePath = path.resolve(dirPath, fileName);

    const imageData = await page.evaluate(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(buffer));
    }, imageUrl);

    const buffer = Buffer.from(imageData);

    try {
      fs.writeFileSync(imagePath, buffer);
      console.log("Image downloaded successfully to:", imagePath);
    } catch (error) {
      console.error("Error writing file:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await browser.close();

    return new Promise((resolve) => resolve(fileName));
  } catch (error) {
    console.log("Image generation error", error);
    await generateImage(point, fileName);
  }
};

export const generateVoiceOver = async (voiceOver, fileName) => {
  let browser;

  if (isLocalEnvironment()) {
    console.log("Running in Local Environment");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } else {
    console.log("Running in Vercel Environment (Production)");
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }

  const page = await browser.newPage();
  await page.goto("https://replicate.com", {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  await page.waitForSelector("div.flex.flex-wrap.gap-4 > button:nth-child(5)");
  await page.evaluate(() => {
    const buttons = document.querySelectorAll(
      "div.flex.flex-wrap.gap-4 > button:nth-child(5)"
    );
    if (buttons.length > 0) {
      buttons[0].scrollIntoView();
      buttons[0].click();
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.waitForSelector("button#model-lucataco-xtts-v2");
  await page.click("button#model-lucataco-xtts-v2");

  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.waitForSelector('input[name="prompt"]');
  await page.evaluate(() => {
    const input = document.querySelector('input[name="prompt"]');
    input.value = "";
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.type(
    'input[name="prompt"]',
    `"This video is about ${fileName}. ${voiceOver}"`
  );

  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');

  await new Promise((resolve) => setTimeout(resolve, 15000));

  let audioSrc = null;
  const maxRetries = 30;
  const retryInterval = 2000;

  for (let i = 0; i < maxRetries; i++) {
    const shadowContent = await page.evaluate(() => {
      const shadowHost = document.querySelector(
        "#hero > div > div.lg\\:px-6.lg\\:pb-6 > div.max-w-site.mx-auto > astro-island > div > div > div.lg\\:p-6.bg-white > div > div > div:nth-child(2) > div > div > div > div > div > div > div.h-24.border.border-black > div > div"
      );
      if (shadowHost && shadowHost.shadowRoot) {
        const shadowRoot = shadowHost.shadowRoot;
        const audioElement = shadowRoot.querySelector("audio");
        return {
          shadowRootContent: shadowRoot.innerHTML,
          audioSrc: audioElement ? audioElement.src : null,
        };
      }
      return { shadowRootContent: null, audioSrc: null };
    });

    console.log("Audio URL:", shadowContent.audioSrc);

    if (shadowContent.audioSrc) {
      audioSrc = shadowContent.audioSrc;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  if (!audioSrc) {
    console.error("Audio URL not found after retries");
    await browser.close();
    return;
  }

  try {
    const audioData = await page.evaluate(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      return Array.from(new Uint8Array(buffer));
    }, audioSrc);

    const buffer = Buffer.from(audioData);
    const dirPath = path.join(process.cwd(), "public/voiceOver");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const audioPath = path.resolve(dirPath, `${fileName}.mp3`);
    await fs.promises.writeFile(audioPath, buffer);
    console.log("Audio downloaded successfully to:", audioPath);
  } catch (error) {
    console.error("Error downloading or writing file:", error);
  }

  await browser.close();
  return new Promise((resolve) => resolve(`${fileName}.mp3`));
};

export const videoConversion = async (images, inputPattern, title) => {
  const execPromise = (cmd) => {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });
  };

  return new Promise(async (resolve, reject) => {
    // const totalDuration = 30;
    // const imageDuration = totalDuration / images.length;
    const audioFile = path.join(process.cwd(), `public/voiceOver/${title}.mp3`);
    const videoPath = path.join(process.cwd(), `public/shorts/${title}.mp4`);

    const durationOutput = await execPromise(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioFile}"`
    );
    const totalDuration = parseFloat(durationOutput.trim());
    const imageDuration = totalDuration / images.length;

    const options = {
      duration: imageDuration,
      fps: 1 / imageDuration,
      videoBitrate: 1024,
      videoCodec: "libx264",
      size: "1080x1920",
    };

    console.log(options);

    const ffmpegCommand = ffmpeg();

    ffmpegCommand
      .input(inputPattern)
      .inputOptions([`-framerate 1/${imageDuration}`]);

    if (audioFile) {
      ffmpegCommand
        .input(audioFile)
        .inputOptions([`-t ${totalDuration}`])
        .audioBitrate("128k")
        .audioChannels(2);
    }

    ffmpegCommand
      .videoCodec(options.videoCodec || "libx264")
      .size(options.size || "720x1280")
      .autopad()
      .outputOptions(["-pix_fmt yuv420p", `-t ${totalDuration}`])
      .on("start", (commandLine) => {
        console.log("Spawned FFmpeg with command: " + commandLine);
      })
      .on("error", (err) => {
        console.error("Error:", err);
        reject(err);
      })
      .on("end", () => {
        console.log("Video processing finished!");
        const encodedVideoUrl = encodeURIComponent(`${title}.mp4`);
        resolve({
          videoPath,
          url: `/shorts/${encodedVideoUrl}`,
          fileName: title,
        });
      });

    ffmpegCommand.save(videoPath);
  });
};
