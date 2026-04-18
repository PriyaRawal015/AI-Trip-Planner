import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBfQL9i78UxTgOSS6JpNbjqxta90Ygop1U";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const result = await genAI.listModels();
    console.log("Available models:");
    result.models.forEach((m) => {
      console.log(`${m.name} - ${m.supportedGenerationMethods}`);
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
