import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBfQL9i78UxTgOSS6JpNbjqxta90Ygop1U";
const genAI = new GoogleGenerativeAI(apiKey);

async function testGeneration() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = "Say 'Model 2.0 is working' if you receive this.";
    const result = await model.generateContent(prompt);
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Generation failed:", error);
  }
}

testGeneration();
