import type { CreateDocumentInput, DocumentRecord } from "@/types/persistence";

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
        ? data.message
        : "Unexpected API error";
    throw new Error(message);
  }

  return data as T;
}

export async function createDocumentRecord(
  input: CreateDocumentInput
): Promise<{ document: DocumentRecord }> {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseJson<{ document: DocumentRecord }>(response);
}

export async function listDocumentsByDeal(
  dealId: string
): Promise<{ documents: DocumentRecord[] }> {
  const response = await fetch(`/api/documents?dealId=${encodeURIComponent(dealId)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseJson<{ documents: DocumentRecord[] }>(response);
}