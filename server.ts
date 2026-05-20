import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini API
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// Translation API endpoint
app.post("/api/translate", async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Please enter some text to translate." });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: "Text is too long. Please limit your input to 5000 characters." });
  }

  const prompt = `Translate the following text from ${sourceLang === "auto" ? "autodetected language" : sourceLang} to ${targetLang}.
If the source language is 'auto', first identify what the language is.
Source Text: "${text}"
Respond with ONLY the translated text. Do not include any explanations or meta-commentary.`;

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("API_KEY_MISSING");
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const translatedText = response.text || "Translation failed to generate.";
      return res.json({ translatedText });
    } catch (error: any) {
      attempt++;
      
      let errorMessage = error.message || "Unknown error";
      try {
        // Try to parse JSON error message if it exists
        if (typeof errorMessage === 'string' && (errorMessage.startsWith('{') || errorMessage.includes('"error":'))) {
          const parsed = JSON.parse(errorMessage);
          if (parsed.error?.message) {
            errorMessage = parsed.error.message;
          }
        }
      } catch (e) {
        // Not JSON, keep original
      }

      console.error(`Attempt ${attempt}/${maxRetries} failed:`, errorMessage);

      const isServiceUnavailable = errorMessage.includes("503") || 
                                   errorMessage.toLowerCase().includes("high demand") || 
                                   errorMessage.toLowerCase().includes("unavailable") ||
                                   errorMessage.toLowerCase().includes("temporary");
      
      const isInvalidKey = errorMessage.includes("API_KEY_INVALID") || 
                           errorMessage.includes("401") || 
                           errorMessage.includes("403") ||
                           errorMessage.includes("invalid-api-key");
                           
      const isRateLimit = errorMessage.includes("429") || 
                          errorMessage.toLowerCase().includes("quota") ||
                          errorMessage.toLowerCase().includes("rate limit");

      if (isServiceUnavailable && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      let userFriendlyMessage = "Internal server error. Please try again.";
      let status = 500;

      if (errorMessage === "API_KEY_MISSING") {
        userFriendlyMessage = "Gemini API key is missing. Please configure it in the AI Studio Secrets panel.";
      } else if (isInvalidKey) {
        userFriendlyMessage = "Invalid API key. Please check your configuration in the Secrets panel.";
        status = 401;
      } else if (isRateLimit) {
        userFriendlyMessage = "Too many requests or quota exceeded. Please slow down.";
        status = 429;
      } else if (isServiceUnavailable) {
        userFriendlyMessage = "The AI service is temporarily unavailable due to high demand. Please try again in a few moments.";
        status = 503;
      } else {
        userFriendlyMessage = errorMessage;
      }

      return res.status(status).json({ error: userFriendlyMessage });
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
