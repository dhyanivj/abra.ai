import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

export async function POST(req: NextRequest) {
  let ai: GoogleGenAI;
  
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    ai = new GoogleGenAI({
      googleAuthOptions: {
        scopes: [
          "https://www.googleapis.com/auth/cloud-platform",
          "https://www.googleapis.com/auth/generative-language"
        ]
      }
    });
  } else {
    return NextResponse.json(
      { error: "Neither GEMINI_API_KEY nor GOOGLE_APPLICATION_CREDENTIALS environment variables are configured." },
      { status: 500 }
    );
  }

  let tempFilePath: string | null = null;
  let geminiFileName: string | null = null;

  try {
    const formData = await req.formData();
    const videoFile = formData.get("video") as File;
    const prompt = formData.get("prompt") as string;

    if (!videoFile) {
      return NextResponse.json({ error: "Missing video file" }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ error: "Missing magic prompt" }, { status: 400 });
    }

    // Convert file to buffer and write to temp file
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `magic-${Date.now()}-${videoFile.name || "video.webm"}`);
    await fs.writeFile(tempFilePath, buffer);

    console.log("Uploading file to Gemini File API:", tempFilePath);
    let uploadedFile = await ai.files.upload({
      file: tempFilePath,
      config: {
        mimeType: videoFile.type || "video/webm",
        displayName: videoFile.name || "setup-video.webm",
      },
    });

    if (!uploadedFile.name) {
      throw new Error("No name returned from uploaded file.");
    }
    geminiFileName = uploadedFile.name;
    console.log("Uploaded Gemini file name:", geminiFileName);

    // Poll until file is ACTIVE
    let fileState = uploadedFile.state;
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max

    while (fileState !== "ACTIVE" && attempts < maxAttempts) {
      if (fileState === "FAILED") {
        throw new Error("Gemini file processing failed.");
      }
      console.log(`Polling Gemini file status... (attempt ${attempts + 1}, current state: ${fileState})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      uploadedFile = await ai.files.get({ name: geminiFileName });
      fileState = uploadedFile.state;
      attempts++;
    }

    if (fileState !== "ACTIVE") {
      throw new Error("Timeout waiting for Gemini file to become ACTIVE.");
    }

    console.log("Gemini file is ACTIVE. Creating interaction...");

    // Call interactions API
    const interaction = await ai.interactions.create({
      model: "gemini-omni-flash-preview",
      input: [
        { type: "text", text: prompt },
        { 
          type: "video", 
          uri: uploadedFile.uri, 
          mime_type: (uploadedFile.mimeType || "video/webm").split(";")[0] as any
        }
      ]
    });

    console.log("Interaction response received. Checking for video output...");

    if (!interaction.output_video || !interaction.output_video.data) {
      if (interaction.output_text) {
        throw new Error(`Model returned text instead of video: ${interaction.output_text}`);
      }
      throw new Error("Model failed to generate output video.");
    }

    const outputVideoBase64 = interaction.output_video.data;
    console.log("Magic video generated successfully!");

    return NextResponse.json({
      success: true,
      video: outputVideoBase64,
    });

  } catch (error: any) {
    console.error("Error during Magic generation:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during processing." },
      { status: 500 }
    );
  } finally {
    // Cleanup local temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log("Cleaned up local temp file:", tempFilePath);
      } catch (err) {
        console.error("Failed to clean up local temp file:", err);
      }
    }

    // Cleanup Gemini file
    if (geminiFileName) {
      try {
        await ai.files.delete({ name: geminiFileName });
        console.log("Cleaned up Gemini file:", geminiFileName);
      } catch (err) {
        console.error("Failed to clean up Gemini file:", err);
      }
    }
  }
}
