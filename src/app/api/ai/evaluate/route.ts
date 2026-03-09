import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a strict debate analysis engine. Analyze the argument and return ONLY a valid JSON object, no preamble, no markdown fences.

Event type taxonomy — use these exact values, they map directly to how sophisms and fallacies are stored in the database:
- "claim": a direct assertion or thesis
- "evidence": factual support, data, or example
- "nuance": a qualification or concession that strengthens credibility
- "counter_argument": a direct rebuttal to the opponent's point
- "sophism": any logical fallacy (straw man, slippery slope, false dilemma, appeal to authority, etc.)
- "ad_hominem": a personal attack on the opponent rather than their argument — this is a sophism targeting the person
- "irrelevance": an argument that does not address the debate topic
- "repetition": restating a point already made without adding new substance

{"evaluation_summary":{"move_quality":"brilliant|excellent|good|inaccuracy|mistake|blunder","dominance_shift":boolean,"momentum":"A|B|neutral"},"argument_analysis":{"thesis_detected":"string","new_argument":boolean,"responds_to_opponent":boolean,"contradiction_detected":boolean,"repetition_detected":boolean},"events":[{"type":"claim|evidence|nuance|counter_argument|sophism|ad_hominem|irrelevance|repetition","impact_score":0,"severity":"low|medium|high","description":"short explanation of the specific fallacy or event"}],"score_update":{"player":"A|B","previous_score":0,"delta":0,"new_score":0},"live_metrics":{"clarity":0,"logic":0,"strategic_value":0}}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { debateContext, apiUrl, modelName, apiKey } = body;

    const url = apiUrl || process.env.LLM_API_URL || "https://api.groq.com/openai/v1/chat/completions";
    const model = modelName || process.env.LLM_MODEL || "llama-3.3-70b-versatile";
    const key = apiKey || process.env.LLM_API_KEY || "your_api_key_here";
    console.log("Evaluating with LLM:", { url, model });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Here is the current debate state and the new message to evaluate:\n${JSON.stringify(debateContext)}` }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Evaluation Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
