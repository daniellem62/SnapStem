import { Pinecone } from "@pinecone-database/pinecone"
import { createEmbedding } from "./embedding"

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
})

// Get the index
const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "")

export async function searchSimilarImages(imageBuffer: Buffer) {
  try {
    // Generate embedding for the uploaded image
    const embedding = await createEmbedding(imageBuffer)

    // Query Pinecone for similar vectors
    const queryResponse = await index.query({
      vector: embedding,
      topK: 9,
      includeMetadata: true,
      includeValues: false,
    })

    // Format the results
    const results = queryResponse.matches.map((match) => ({
      id: match.id,
      similarity: match.score,
      imageUrl: match.metadata?.imageUrl || "/placeholder.svg?height=300&width=300",
      metadata: match.metadata || {},
    }))

    return results
  } catch (error) {
    console.error("Error searching similar images:", error)
    throw new Error("Failed to search for similar images")
  }
}

export async function indexImage(imageBuffer: Buffer, metadata: any) {
  try {
    // Generate embedding for the image
    const embedding = await createEmbedding(imageBuffer)

    // Create a unique ID for the vector
    const id = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    // Upsert the vector into Pinecone
    await index.upsert([
      {
        id,
        values: embedding,
        metadata,
      },
    ])

    return id
  } catch (error) {
    console.error("Error indexing image:", error)
    throw new Error("Failed to index image")
  }
}

