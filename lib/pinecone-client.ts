import { createEmbedding } from "./embedding";
import { Pinecone } from "@pinecone-database/pinecone";
import sharp from "sharp";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "image-search");

export async function searchSimilarImages(
  imageBuffer: Buffer,
  topK = 10, // Request more results initially
  minSimilarity = 0.9 // Only return matches with 90% or higher similarity
) {
  console.log(
    "searchSimilarImages function called with buffer size:",
    imageBuffer.length
  );
  try {
    // Create vector embedding from the image
    const result = await createEmbedding(imageBuffer);
    const embedding = result.embedding;
    const plantName = result.plantName;

    console.log(
      "Embedding generated:",
      embedding.length,
      "dimensions, sample:",
      embedding.slice(0, 5)
    );
    console.log("Plant identified as:", plantName);

    // Query Pinecone index with the embedding
    console.log("Querying Pinecone...");
    const queryResult = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });
    console.log("Pinecone query result:", queryResult);

    // Filter results by similarity threshold
    const filteredResults = queryResult.matches.filter(
      (match) => (match.score ?? 0) >= minSimilarity
    );

    console.log(
      `Filtered from ${queryResult.matches.length} to ${filteredResults.length} results with threshold ${minSimilarity}`
    );

    return filteredResults;
  } catch (error) {
    console.error("Error searching similar images:", error);
    throw new Error("Failed to search for similar images");
  }
}

// Function to add images to the index (for reference)
export async function addImageToIndex(
  imageBuffer: Buffer,
  id: string,
  metadata: any
) {
  try {
    // Get embedding and plant name
    const result = await createEmbedding(imageBuffer);
    const embedding = result.embedding;
    const plantName = result.plantName;

    // Compress the image
    const compressImage = async (buffer: Buffer): Promise<string> => {
      const compressed = await sharp(buffer)
        .resize(300, 300, { fit: "inside" })
        .jpeg({ quality: 70 })
        .toBuffer();
      return compressed.toString("base64");
    };

    const imageBase64 = await compressImage(imageBuffer);

    // Add plant name to metadata
    const enhancedMetadata = {
      ...metadata,
      title: plantName, // Use plant name as title instead of file name
      originalName: metadata.name, // Keep original filename
      imageBase64: imageBase64,
    };

    // Upsert to Pinecone
    await index.upsert([
      {
        id,
        values: embedding,
        metadata: enhancedMetadata,
      },
    ]);

    console.log("Image added to index:", id, "as", plantName);
    return { success: true };
  } catch (error) {
    console.error("Error adding image to index:", error);
    throw new Error("Failed to add image to index");
  }
}
