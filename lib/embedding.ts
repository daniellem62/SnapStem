import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function createEmbedding(imageBuffer: Buffer): Promise<number[]> {
  try {
    console.log(
      "Starting embedding creation with buffer size:",
      imageBuffer.length
    );

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString("base64");
    console.log("Base64 image created, length:", base64Image.length);

    console.log("Making Vision API request...");
    // Step 1: Get a detailed description of the image using GPT-4 Vision
    // Update the model in the Vision API request
    const visionResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o", // Updated from gpt-4-vision-preview to gpt-4o which has vision capabilities
          messages: [
            {
              role: "system",
              content:
                "Create a detailed description of this image focusing on visual elements that would help identify similar images.",
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                },
              ],
            },
          ],
          max_tokens: 300, // Reduced token count for faster response
        }),
      }
    );

    // Log response status
    console.log("Vision API response status:", visionResponse.status);

    const visionResult = await visionResponse.json();

    // Check for API errors
    if (visionResult.error) {
      console.error("Vision API error:", visionResult.error);
      throw new Error(`Vision API error: ${visionResult.error.message}`);
    }

    if (!visionResult.choices || !visionResult.choices[0]) {
      console.error(
        "Unexpected Vision API response:",
        JSON.stringify(visionResult).substring(0, 200)
      );
      throw new Error("Invalid Vision API response format");
    }

    const imageDescription = visionResult.choices[0].message.content;
    console.log(
      "Image described as:",
      imageDescription.substring(0, 100) + "..."
    );

    // Step 2: Get text embeddings for the description
    console.log("Requesting text embedding...");
    try {
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002", // Use this model instead of -3-large for wider availability
        input: imageDescription,
      });

      const embeddingResult = await embeddingResponse.json();
      console.log("Embedding API response received");

      if (embeddingResult.error) {
        console.error("Embedding API error:", embeddingResult.error);
        throw new Error(
          `Embedding API error: ${embeddingResult.error.message}`
        );
      }

      if (
        !embeddingResult.data ||
        !embeddingResult.data[0] ||
        !embeddingResult.data[0].embedding
      ) {
        console.error(
          "Invalid embedding response:",
          JSON.stringify(embeddingResult).substring(0, 200)
        );
        throw new Error("Invalid embedding response format");
      }

      const embedding = embeddingResult.data[0].embedding;
      console.log(`Generated embedding with ${embedding.length} dimensions`);
      return embedding;
    } catch (embeddingError) {
      console.error("Error in text embedding step:", embeddingError);
      throw embeddingError;
    }
  } catch (error) {
    console.error("Error creating image embedding:", error);
    throw new Error("Failed to create embedding for image");
  }
}
