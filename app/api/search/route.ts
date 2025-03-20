import { type NextRequest, NextResponse } from "next/server";
import { searchSimilarImages } from "@/lib/pinecone-client";
import { addImageToIndex } from "@/lib/pinecone-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    console.log(image);

    if (!image) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Search for similar images using Pinecone
    const rawResults = await searchSimilarImages(buffer);
    addImageToIndex(buffer, image.name, { name: image.name });
    

    // Transform results to match your frontend component's expected format
    const formattedResults = rawResults.map((item) => ({
      id: item.id,
      imageUrl: item.metadata?.imageBase64
        ? `data:image/jpeg;base64,${item.metadata.imageBase64}`
        : "/placeholder.svg",
      similarity: item.score,
      metadata: {
        title: item.metadata?.title || item.metadata?.name || item.id,
        ...item.metadata,
      },
    }));

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error("Error processing image search:", error);
    return NextResponse.json(
      { error: "Failed to process image search" },
      { status: 500 }
    );
  }
}
