import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function createEmbedding(
  imageBuffer: Buffer
): Promise<{
  embedding: number[];
  plantName: string;
  plantDescription: string;
  careRequirements: string;
}> {
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
    // Modify the messages sent to GPT-4o to specifically ask for the plant name
    const visionResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Analyze this plant image. Format your response in 3 sections:\n" +
                "1. Plant Name: [common plant name]\n" +
                "2. Description: [detailed visual description]\n" +
                "3. Care Requirements: [light, water, soil, temperature, humidity needs]",
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
          max_tokens: 500, // Increased token count for more detailed response
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
      "AI response received:",
      imageDescription.substring(0, 100) + "..."
    );

    // Extract plant name and care requirements
    let plantName = "Unknown Plant";
    let plantDescription = "";
    let careRequirements = "";

    // Parse the response into sections
    const sections = imageDescription.split(/\d+\.\s+/); // Split by numbered sections

    if (sections.length >= 4) {
      // [empty first element], Plant Name, Description, Care Requirements
      // Extract plant name from the first section
      const namePart = sections[1];
      if (namePart.toLowerCase().includes("plant name:")) {
        plantName = namePart.replace(/plant name:/i, "").trim();
      } else {
        plantName = namePart.trim();
      }

      // Extract description from the second section
      plantDescription = sections[2].replace(/description:/i, "").trim();

      // Extract care requirements from the third section
      careRequirements = sections[3].replace(/care requirements:/i, "").trim();
    } else {
      // Fallback if sections aren't clearly defined
      if (imageDescription.toLowerCase().includes("plant name:")) {
        const nameMatch = imageDescription.match(/plant name:\s*([^\n]+)/i);
        if (nameMatch) plantName = nameMatch[1].trim();
      }

      if (imageDescription.toLowerCase().includes("care requirements:")) {
        const careMatch = imageDescription.match(
          /care requirements:([\s\S]+?)(?:\n\d+\.|\Z)/i
        );
        if (careMatch) careRequirements = careMatch[1].trim();
      }
    }

    console.log("Extracted plant name:", plantName);
    console.log(
      "Extracted care requirements:",
      careRequirements.substring(0, 50) + "..."
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
      return {
        embedding: embedding,
        plantName: plantName,
        plantDescription: plantDescription,
        careRequirements: careRequirements,
      };
    } catch (embeddingError) {
      console.error("Error in text embedding step:", embeddingError);
      throw embeddingError;
    }
  } catch (error) {
    console.error("Error creating image embedding:", error);
    throw new Error("Failed to create embedding for image");
  }
}
