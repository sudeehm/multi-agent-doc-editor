<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1uhuTptinnToIv4MFx6mIjtK-wXDX4iaz

## 🆕 NEW: Local AI Support with Ollama + Gemma 2B

You can now run this app with **local open-source models** using Ollama! No API costs, complete privacy, works offline.

👉 **[See Ollama Setup Guide](OLLAMA_SETUP.md)** for detailed instructions.

## Run Locally

**Prerequisites:**  Node.js

### Option 1: With Gemini API (Cloud)

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Option 2: With Ollama + Gemma 2B (Local)

1. Install Ollama: https://ollama.com/download
2. Pull Gemma 2B model: `ollama pull gemma2:2b`
3. Install dependencies: `npm install`
4. Run the app: `npm run dev`
5. Click the "Gemma 2B" button in the UI to use local AI!

**See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for complete setup instructions and troubleshooting.**
