export type OpenAiJsonRequest = {
  prompt: string;
  model?: string;
  temperature?: number;
  maxRetries?: number;
  baseDelayMs?: number;
};

export type OpenAiJsonResponse =
  | {
      ok: true;
      data: unknown;
      model: string;
      attempts: number;
    }
  | {
      ok: false;
      error: string;
      status: number | null;
      model: string;
      attempts: number;
    };

const DEFAULT_MODEL = "gpt-4.1-mini";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(params: {
  attempt: number;
  baseDelayMs: number;
  response?: Response;
}) {
  const retryAfter = params.response?.headers.get("retry-after");

  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, 30000);
    }
  }

  const exponentialDelay = params.baseDelayMs * 2 ** params.attempt;
  const jitter = Math.floor(Math.random() * 500);

  return Math.min(exponentialDelay + jitter, 30000);
}

function shouldRetryStatus(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function extractOutputText(json: any) {
  return (
    json.output_text ??
    json.output?.[0]?.content?.[0]?.text ??
    json.output?.[0]?.content?.[0]?.json ??
    null
  );
}

export async function callOpenAiJson(
  request: OpenAiJsonRequest
): Promise<OpenAiJsonResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = request.model ?? DEFAULT_MODEL;
  const maxRetries = request.maxRetries ?? 3;
  const baseDelayMs = request.baseDelayMs ?? 2500;

  if (!apiKey) {
    return {
      ok: false,
      error: "Missing OPENAI_API_KEY",
      status: null,
      model,
      attempts: 0,
    };
  }

  let lastError = "OpenAI request failed";
  let lastStatus: number | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "user",
              content: request.prompt,
            },
          ],
          temperature: request.temperature ?? 0.2,
          text: {
            format: {
              type: "json_object",
            },
          },
        }),
      });

      lastStatus = response.status;

      if (!response.ok) {
        let errorText = `OpenAI API status ${response.status}`;

        try {
          const errorJson = await response.json();
          errorText =
            errorJson?.error?.message ??
            errorJson?.message ??
            errorText;
        } catch {
          // Ignore JSON parsing failure for error response.
        }

        lastError = errorText;

        if (shouldRetryStatus(response.status) && attempt < maxRetries) {
          const delayMs = getRetryDelayMs({
            attempt,
            baseDelayMs,
            response,
          });

          await sleep(delayMs);
          continue;
        }

        return {
          ok: false,
          error: errorText,
          status: response.status,
          model,
          attempts: attempt + 1,
        };
      }

      const json = await response.json();
      const outputText = extractOutputText(json);

      if (!outputText) {
        return {
          ok: false,
          error: "OpenAI response did not include output text",
          status: response.status,
          model,
          attempts: attempt + 1,
        };
      }

      const parsed =
        typeof outputText === "string" ? JSON.parse(outputText) : outputText;

      return {
        ok: true,
        data: parsed,
        model,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "OpenAI request failed";

      if (attempt < maxRetries) {
        const delayMs = getRetryDelayMs({
          attempt,
          baseDelayMs,
        });

        await sleep(delayMs);
        continue;
      }

      return {
        ok: false,
        error: lastError,
        status: lastStatus,
        model,
        attempts: attempt + 1,
      };
    }
  }

  return {
    ok: false,
    error: lastError,
    status: lastStatus,
    model,
    attempts: maxRetries + 1,
  };
}