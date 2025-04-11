// This file is used by Vercel to properly handle the build process

// Export a simple config for Vercel CLI
export default {
  installCommand: "npm install",
  buildCommand: "npm run build",
  outputDirectory: "dist",
  devCommand: "npm run dev",
  framework: "vite"
};