/**
 * AI Health Assistant chat endpoint.
 *
 * Streams a Groq response grounded in the live hospital data assembled by
 * `getHospitalSystemPrompt()`. The API key stays server-side; the browser only
 * ever sees the streamed text.
 *
 * Request:  { messages: [{ role: 'user' | 'assistant', content: string }] }
 * Response: text/plain stream of the assistant's reply.
 */
import Groq from 'groq-sdk';
import { getHospitalSystemPrompt } from '@/lib/hospital-context';

/**
 * Groq retires model IDs on a rolling basis, so this is overridable without a
 * code change. List what your key can currently reach with:
 *   curl -s https://api.groq.com/openai/v1/models \
 *     -H "Authorization: Bearer $GROQ_API_KEY" | grep '"id"'
 */
const MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

/** Caps a single turn so one long message can't blow up the request. */
const MAX_MESSAGE_CHARS = 4000;
/** Caps history so a long session stays within a predictable cost per request. */
const MAX_HISTORY = 20;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false;
  const { role, content } = value as Record<string, unknown>;
  return (role === 'user' || role === 'assistant') && typeof content === 'string';
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'The AI assistant is not configured. Add GROQ_API_KEY to .env.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(rawMessages) || !rawMessages.every(isChatMessage)) {
    return Response.json({ error: 'Expected a `messages` array.' }, { status: 400 });
  }

  const history = rawMessages
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content.trim().length > 0);

  if (history.length === 0) {
    return Response.json({ error: 'No message to respond to.' }, { status: 400 });
  }

  const system = await getHospitalSystemPrompt();
  const client = new Groq({ apiKey });

  // Streamed so the reply appears as it is written rather than after a pause.
  // Groq speaks the OpenAI dialect: the system prompt is the first message
  // rather than a separate parameter.
  let stream;
  try {
    stream = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: 1024,
      stream: true,
      messages: [{ role: 'system', content: system }, ...history],
    });
  } catch (error) {
    console.error('[api/chat] Groq request failed:', error);

    // A retired or misspelled model ID is the most likely misconfiguration, and
    // the generic message sends people hunting in the wrong place.
    const status = error instanceof Groq.APIError ? error.status : undefined;
    if (status === 404) {
      return Response.json(
        { error: `Model "${MODEL}" is unavailable. Set GROQ_MODEL in .env to a current model.` },
        { status: 502 },
      );
    }
    if (status === 401) {
      return Response.json({ error: 'GROQ_API_KEY was rejected.' }, { status: 502 });
    }
    if (status === 429) {
      return Response.json(
        { error: 'The assistant is rate limited right now. Please try again shortly.' },
        { status: 429 },
      );
    }
    return Response.json({ error: 'The assistant is unavailable right now.' }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (error) {
        console.error('[api/chat] stream failed:', error);
        controller.enqueue(
          encoder.encode(
            '\n\nSorry — I lost the connection. Please try again, or call the hospital if it is urgent.',
          ),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      // The user navigated away or sent a new message; stop the generation.
      stream.controller.abort();
    },
  });

  return new Response(body$, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
