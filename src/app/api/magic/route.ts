import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 300; // 5 minutes max duration for video generation

export async function POST(req: NextRequest) {
  const project = process.env.GOOGLE_CLOUD_PROJECT || "starry-hawk-497801-t4";
  // Veo models on Vertex AI are hosted in us-central1
  const location =
    process.env.GOOGLE_CLOUD_LOCATION &&
    process.env.GOOGLE_CLOUD_LOCATION !== "global"
      ? process.env.GOOGLE_CLOUD_LOCATION
      : "us-central1";

  if (!project) {
    return NextResponse.json(
      { error: "GOOGLE_CLOUD_PROJECT environment variable is not set." },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string | null;
    const videoFile = formData.get("video") as File | null;
    const imageFile = formData.get("image") as File | null;
    const imageBase64Param = formData.get("image_base64") as string | null;

    if (!prompt) {
      return NextResponse.json({ error: "Missing magic prompt" }, { status: 400 });
    }

    let imageInput: { imageBytes: string; mimeType: string } | undefined;

    if (imageFile) {
      const imgBuffer = Buffer.from(await imageFile.arrayBuffer());
      const mime = (imageFile.type || "image/jpeg").split(";")[0];
      imageInput = {
        imageBytes: imgBuffer.toString("base64"),
        mimeType: mime,
      };
    } else if (imageBase64Param) {
      const cleanBase64 = imageBase64Param.replace(/^data:image\/\w+;base64,/, "");
      imageInput = {
        imageBytes: cleanBase64,
        mimeType: "image/jpeg",
      };
    }

    console.log(
      `[abra.ai] Triggering Veo 3.1 (veo-3.1-generate-001). Project: ${project}, Location: ${location}, Has Image: ${!!imageInput}`
    );

    // Call Veo 3.1 video generation model
    const operation = await ai.models.generateVideos({
      model: "veo-3.1-generate-001",
      prompt,
      ...(imageInput ? { image: imageInput } : {}),
      config: {
        durationSeconds: 6,
        aspectRatio: "16:9",
        personGeneration: "allow_adult",
        enhancePrompt: true,
      },
    });

    console.log(`[abra.ai] Veo 3.1 operation started: ${operation.name}`);

    // Poll until completed
    let currentOp = operation;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5s interval * 60)

    while (!currentOp.done && attempts < maxAttempts) {
      await new Promise((res) => setTimeout(res, 5000));
      attempts++;
      currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
      console.log(`[abra.ai] Polling operation step ${attempts}... done: ${currentOp.done}`);
    }

    if (!currentOp.done) {
      throw new Error("Veo 3.1 video generation timed out. Please try again.");
    }

    if (currentOp.error) {
      const errMsg = currentOp.error.message || JSON.stringify(currentOp.error);
      console.error("[abra.ai] Veo 3.1 Operation Error:", errMsg);
      throw new Error(`Veo 3.1 Generation Error: ${errMsg}`);
    }

    const generatedVideo = currentOp.response?.generatedVideos?.[0]?.video;
    if (!generatedVideo) {
      throw new Error("Veo 3.1 completed but returned no video output.");
    }

    let videoBase64: string | undefined = generatedVideo.videoBytes;

    if (!videoBase64 && generatedVideo.uri) {
      console.log(`[abra.ai] Downloading video output from URI: ${generatedVideo.uri}`);
      try {
        if (typeof (ai.files as any).downloadMedia === "function") {
          const mediaBytes = await (ai.files as any).downloadMedia(generatedVideo.uri);
          videoBase64 = Buffer.from(mediaBytes).toString("base64");
        } else {
          const res = await fetch(generatedVideo.uri);
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            videoBase64 = buf.toString("base64");
          }
        }
      } catch (dlErr: any) {
        console.error("[abra.ai] Failed to download media from URI:", dlErr);
        throw new Error(`Failed to download generated video: ${dlErr.message}`);
      }
    }

    if (!videoBase64) {
      throw new Error("Failed to extract video content from Veo 3.1 response.");
    }

    console.log(`[abra.ai] Success! Veo 3.1 video generated. Base64 length: ${videoBase64.length}`);
    return NextResponse.json({ success: true, video: videoBase64 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[abra.ai] Error:", message);
    return NextResponse.json(
      { error: message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

