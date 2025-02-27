import { OpenAIApi, Configuration } from "openai-edge";

// Initialize OpenAI configuration
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Placeholder function to create image embeddings using CLIP (or any other model)
export async function createImageEmbedding(imageBuffer: Buffer): Promise<number[]> {
  try {
    // You can use OpenAI's CLIP model or any other model here
    const response = await openai.createEmbedding({
      model: "openai/clip-vit-base-patch32", // Use CLIP for images
      input: imageBuffer.toString('base64'),  // Convert image buffer to base64 string
    });

    // Assuming response.data contains the embedding
    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("Error creating image embedding:", error);
    throw new Error("Failed to create embedding for image");
  }
}

