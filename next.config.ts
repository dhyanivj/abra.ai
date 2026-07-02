import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Do NOT bundle @google/genai — let Node.js resolve it at runtime.
  // This avoids module-not-found errors caused by the parent /Coding/package-lock.json
  // being picked up as the workspace root.
  serverExternalPackages: ["@google/genai"],

  // Tell Next.js the actual project root for output file tracing
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
