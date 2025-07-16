import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { entries, mode } = body;

  const prompt =
    mode === 'bulk' ? makeBulkPrompt(entries) : makeSinglePrompt(entries[0]);

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const raw = chat.choices[0].message?.content || '';
    console.log('RAW GPT OUTPUT:', raw);

    const firstBrace = raw.indexOf('{');

    // If GPT doesn't return any JSON-looking structure
    if (firstBrace === -1 || raw.length - firstBrace < 10) {
      console.error('GPT returned non-JSON:', raw);
      return NextResponse.json({
        biases: [],
        execution_issues: [],
        emotions: [],
        reflection: 'GPT returned an error or unstructured response: ' + raw,
        action_items: [],
      });
    }

    const jsonCandidate = raw.slice(firstBrace).trim();

    try {
      const json = JSON.parse(jsonCandidate);
      return NextResponse.json(json);
    } catch (parseError) {
      console.error('JSON parse failed:', parseError, 'Raw:', raw);
      return NextResponse.json({
        biases: [],
        execution_issues: [],
        emotions: [],
        reflection: 'Parse failed. GPT returned: ' + raw,
        action_items: [],
      });
    }
  } catch (e) {
    console.error('GPT API error (network or quota):', e);
    return NextResponse.json({
      biases: [],
      execution_issues: [],
      emotions: [],
      reflection: 'GPT API error occurred. Check logs or quota.',
      action_items: [],
    });
  }
}

function makeSinglePrompt(entry: string) {
  return `You are a professional trading coach. Analyze this trading journal entry:

  ${entry}

  Return:
- biases (list of strings like "Bias: Explanation")
- execution_issues (list of strings)
- emotions (list of strings)
- reflection (short paragraph string)
- action_items (2–3 strings)

Respond ONLY with valid JSON in this format:
{
  "biases": ["...", "..."],
  "execution_issues": ["...", "..."],
  "emotions": ["...", "..."],
  "reflection": "...",
  "action_items": ["...", "..."]
}

DO NOT explain or introduce the output. No commentary. Just raw JSON.`;
}

function makeBulkPrompt(entries: string[]) {
  return `Analyze these ${entries.length} journal entries:

  ${entries.map((e, i) => `Entry ${i + 1}: ${e}`).join('\n\n')}

  Give:
  1. Recurring biases
  2. Common execution flaws
  3. Dominant emotions
  4. 3 key improvement areas

  Format:
  {
    "patterns": [...],
    "common_issues": [...],
    "dominant_emotions": [...],
    "top_focus_areas": [...]
  }`;
}
