import type {
  CreateDealInput,
  DealRecord,
  UpdateDealInput,
} from "@/types/persistence";

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

export async function listDeals(): Promise<{ deals: DealRecord[] }> {
  const response = await fetch("/api/deals", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseJson<{ deals: DealRecord[] }>(response);
}

export async function createDeal(
  input: CreateDealInput
): Promise<{ deal: DealRecord }> {
  const response = await fetch("/api/deals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseJson<{ deal: DealRecord }>(response);
}

export async function getDeal(
  dealId: string
): Promise<{ deal: DealRecord | null }> {
  const response = await fetch(`/api/deals/${dealId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseJson<{ deal: DealRecord | null }>(response);
}

export async function updateDeal(
  dealId: string,
  input: UpdateDealInput
): Promise<{ deal: DealRecord }> {
  const response = await fetch(`/api/deals/${dealId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return parseJson<{ deal: DealRecord }>(response);
}