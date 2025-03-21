import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Call OpenAI API with the prompt
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are PlantPal, an expert botanist and gardening assistant. Provide helpful, accurate information about plant care, identification, and gardening best practices. Keep responses concise and practical. Do not use any markdown language,"
          },
          // Add plant context if available
          ...(context ? [{
            role: "system", 
            content: `The user's current plant is: ${context}`
          }] : []),
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const result = await response.json();
    
    if (result.error) {
      console.error("OpenAI API error:", result.error);
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: result.choices[0].message.content
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}