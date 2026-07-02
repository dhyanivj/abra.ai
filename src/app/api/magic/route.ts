import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 300; // 5 minutes for long AI processing

export async function POST(req: NextRequest) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  // Gemini Omni interactions API requires location = "global"
  const location = process.env.GOOGLE_CLOUD_LOCATION || "global";

  if (!project) {
    return NextResponse.json(
      { error: "GOOGLE_CLOUD_PROJECT environment variable is not set." },
      { status: 500 }
    );
  }

  // Vertex AI (Gemini Enterprise Agent Platform) mode.
  // GOOGLE_APPLICATION_CREDENTIALS is auto-picked up by google-auth-library.
  const ai = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  try {
    const formData = await req.formData();
    const videoFile = formData.get("video") as File | null;
    const prompt = formData.get("prompt") as string | null;

    if (!videoFile) {
      return NextResponse.json({ error: "Missing video file" }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json({ error: "Missing magic prompt" }, { status: 400 });
    }

    // Convert to base64 — Vertex AI Enterprise doesn't support files.upload(),
    // so we inline the video directly in the interactions input.
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    const base64Video = buffer.toString("base64");
    const mimeType = (videoFile.type || "video/webm").split(";")[0] as
      | "video/webm"
      | "video/mp4";

    console.log(
      `[abra.ai] Calling gemini-omni-flash-preview. Video: ${(buffer.length / 1024).toFixed(1)} KB, mime: ${mimeType}, location: ${location}`
    );

    // Interactions API: video-in → video-out
    const interaction = await ai.interactions.create({
      model: "gemini-omni-flash-preview",
      stream: false,
      response_modalities: ["video"],
      input: [
        { type: "text", text: prompt },
        {
          type: "video",
          data: base64Video,
          mime_type: mimeType,
        },
      ],
    });

    console.log(`[abra.ai] Interaction status: ${(interaction as any).status}`);
    console.log(`[abra.ai] output_video present: ${!!interaction.output_video}`);

    // Primary path: SDK extracts output_video from steps automatically
    let videoBase64 = interaction.output_video?.data;

    // Fallback: manually walk steps to find the video content block
    if (!videoBase64) {
      const steps = (interaction as any).steps as Array<{
        type: string;
        content?: Array<{ type: string; data?: string; mime_type?: string }>;
      }> | undefined;

      if (steps) {
        for (const step of steps) {
          if (step.type === "model_output" && step.content) {
            for (const block of step.content) {
              if (block.type === "video" && block.data) {
                videoBase64 = block.data;
                console.log("[abra.ai] Found video in steps fallback.");
                break;
              }
            }
          }
          if (videoBase64) break;
        }
      }
    }

    if (!videoBase64) {
      const debugText = interaction.output_text
        ? `Model returned text: "${interaction.output_text.slice(0, 300)}"`
        : `No video output. Status: ${(interaction as any).status}. Keys: ${Object.keys(interaction).join(", ")}`;
      console.error("[abra.ai] No video:", debugText);
      throw new Error(debugText);
    }

    console.log(`[abra.ai] Success! Video base64 length: ${videoBase64.length}`);
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
