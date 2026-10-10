import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Language } from "@/lib/resume/schema";
import type { Provider } from "./providers";

const LANGUAGE_NAME: Record<Language, string> = { id: "Indonesian", en: "English" };

const SYSTEM_PROMPT = `You translate CV (resume) text for job applications.
Rules:
- Return one translation per input string, same order, same count.
- Keep proper nouns, company and school names, product names, programming languages, frameworks, libraries, and technical terms exactly as written (e.g. React, PostgreSQL, YOLOv11, REST API, Raspberry Pi 5).
- Keep numbers, GPA values, and separators like "|" and "—". Translate month names and words like "Saat Ini"/"Present".
- Keep line breaks ("\\n") exactly; each line is one CV bullet.
- Use concise, professional CV phrasing in the target language. Do not add or remove content.`;

const outputSchema = z.object({ translations: z.array(z.string()) });

export const claudeProvider: Provider = async (batch, source, target) => {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: zodOutputFormat(outputSchema) },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Translate from ${LANGUAGE_NAME[source]} to ${LANGUAGE_NAME[target]}. Input strings (JSON array, ${batch.length} items):\n${JSON.stringify(batch)}`,
      },
    ],
  });
  if (response.stop_reason === "refusal") throw new Error("Layanan terjemahan menolak permintaan ini.");
  if (response.stop_reason === "max_tokens") throw new Error("CV terlalu panjang untuk diterjemahkan sekaligus.");
  const translations = response.parsed_output?.translations;
  if (!translations) throw new Error("Hasil terjemahan tidak valid.");
  return translations;
};

const GOOGLE_CHUNK_CHARS = 1500;

async function googleTranslate(text: string, source: Language, target: Language): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (response.ok) {
      const data = (await response.json()) as [Array<[string]>];
      return data[0].map(part => part[0]).join("");
    }
    if (response.status !== 429 || attempt >= 3) throw new Error(`Google Translate HTTP ${response.status}`);
    await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
  }
}

/** Groups lines into requests of at most GOOGLE_CHUNK_CHARS characters. */
function chunkLines(lines: string[]): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const line of lines) {
    if (current.length > 0 && size + line.length + 1 > GOOGLE_CHUNK_CHARS) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(line);
    size += line.length + 1;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

/**
 * Free fallback without an API key. Sends many lines per request (joined by newlines) to stay under
 * the endpoint's rate limit; when a chunk comes back with a different line count, retranslates its
 * lines one by one so bullets never shift.
 */
export const googleProvider: Provider = async (batch, source, target) => {
  const lines = [...new Set(batch.flatMap(value => value.split("\n")).filter(line => line.trim()))];
  const translatedLines = new Map<string, string>();
  for (const chunk of chunkLines(lines)) {
    const parts = (await googleTranslate(chunk.join("\n"), source, target)).split("\n");
    if (parts.length === chunk.length) {
      chunk.forEach((line, index) => translatedLines.set(line, parts[index].trim()));
    } else {
      for (const line of chunk) translatedLines.set(line, await googleTranslate(line, source, target));
    }
  }
  return batch.map(value =>
    value
      .split("\n")
      .map(line => translatedLines.get(line) ?? line)
      .join("\n"),
  );
};

export function defaultProvider(): Provider {
  return process.env.ANTHROPIC_API_KEY ? claudeProvider : googleProvider;
}
