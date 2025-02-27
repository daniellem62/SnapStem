import { createEmbedding } from "./embedding";
import { Pinecone } from "@pinecone-database/pinecone";
import sharp from "sharp";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "image-search");

export async function searchSimilarImages(imageBuffer: Buffer, topK = 5) {
  console.log(
    "searchSimilarImages function called with buffer size:",
    imageBuffer.length
  );
  try {
    // Create vector embedding from the image
    const embedding = await createEmbedding(imageBuffer);
    console.log(
      "Embedding generated:",
      embedding.length,
      "dimensions, sample:",
      embedding.slice(0, 5)
    );

    // Query Pinecone index with the embedding
    console.log("Querying Pinecone...");
    const queryResult = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });
    console.log("Pinecone query result:", queryResult);

    // Return matched items with their metadata and scores
    return queryResult.matches.map((match) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
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
    const compressImage = async (buffer: Buffer): Promise<string> => {
      // With sharp:
      const compressed = await sharp(buffer)
        .resize(300, 300, { fit: "inside" })
        .jpeg({ quality: 70 })
        .toBuffer();
      return compressed.toString("base64");
    };

    // Correct way - await the async function
    const imageBase64 = await compressImage(imageBuffer);
    const enhancedMetadata = {
      ...metadata,
      imageBase64: imageBase64,
    };

    const embedding = await createEmbedding(imageBuffer);

    // Log for debugging
    console.log(
      "Storing image in Pinecone with base64 length:",
      imageBase64.length
    );

    await index.upsert([
      {
        id,
        values: embedding,
        metadata: enhancedMetadata,
      },
    ]);

    console.log("Image added to index:", id);
    return { success: true };
  } catch (error) {
    console.error("Error adding image to index:", error);
    throw new Error("Failed to add image to index");
  }
}
