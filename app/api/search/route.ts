import { type NextRequest, NextResponse } from "next/server"
import { searchSimilarImages } from "@/lib/pinecone-client"
import {addImageToIndex} from "@/lib/pinecone-client"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    console.log(image)

    if (!image) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Search for similar images using Pinecone
    const results = await searchSimilarImages(buffer)
    addImageToIndex(buffer, image.name, { name: image.name })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error processing image search:", error)
    return NextResponse.json({ error: "Failed to process image search" }, { status: 500 })
  }
}

