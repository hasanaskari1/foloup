import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  logger.info("analyze-transcript request received");

  try {
    const body = await req.json();
    const { transcript, question, candidateName, analytics, callAnalysis } = body;

    // Prepare context for the AI
    const systemPrompt = `You are an AI assistant helping HR professionals analyze interview transcripts. 
    You have access to the interview transcript and analytics data. 
    Provide concise, insightful answers based on the data provided.
    Focus on being helpful and objective in your analysis.
    When discussing the candidate, use their name (${candidateName || 'the candidate'}).`;

    const context = `
Interview Transcript:
${transcript}

Analytics Summary:
- Overall Hiring Score: ${analytics?.overallScore || 'N/A'}%
- Overall Feedback: ${analytics?.overallFeedback || 'N/A'}
- Communication Score: ${analytics?.communication?.score || 'N/A'}/10
- Communication Feedback: ${analytics?.communication?.feedback || 'N/A'}
- General Intelligence: ${analytics?.generalIntelligence || 'N/A'}

Call Analysis:
- User Sentiment: ${callAnalysis?.user_sentiment || 'N/A'}
- Call Summary: ${callAnalysis?.call_summary || 'N/A'}
- Completion Rating: ${callAnalysis?.call_completion_rating || 'N/A'}
- Task Completion: ${callAnalysis?.agent_task_completion_rating || 'N/A'}

Question Summaries:
${analytics?.questionSummaries?.map((qs: any, index: number) => 
  `Q${index + 1}: ${qs.question}\nAnswer Summary: ${qs.summary}`
).join('\n\n') || 'N/A'}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${context}\n\nUser Question: ${question}` }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content || "I couldn't generate a response.";

    logger.info("Transcript analysis completed successfully");

    return NextResponse.json(
      { answer },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error analyzing transcript:", error as Error);
    
    return NextResponse.json(
      { 
        error: "Failed to analyze transcript",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
