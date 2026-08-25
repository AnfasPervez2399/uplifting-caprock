import type { StepId } from "./types";

export type AssistantServiceMode = "checking" | "ai" | "grounded";

export interface AssistantHistoryEntry {
  role: "assistant" | "user";
  text: string;
}

interface AssistantRequestContext {
  applicationType: string;
  activeStepId: StepId;
  activeStepName: string;
  activeStepComplete: boolean;
  submitted: boolean;
  incompleteSections: string[];
}

interface AssistantRequest {
  message: string;
  groundedAnswer: string;
  history: AssistantHistoryEntry[];
  context: AssistantRequestContext;
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) throw new Error("INVALID_ASSISTANT_RESPONSE");
  return response.json();
}

export async function checkAssistantService(signal?: AbortSignal): Promise<AssistantServiceMode> {
  try {
    const response = await fetch("/api/onboarding-assistant/status", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
    if (!response.ok) return "grounded";
    const payload = await readJsonResponse(response) as { available?: boolean };
    return payload.available ? "ai" : "grounded";
  } catch {
    return "grounded";
  }
}

export async function requestAssistantAnswer(request: AssistantRequest, signal: AbortSignal): Promise<string> {
  const response = await fetch("/api/onboarding-assistant", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });
  const payload = await readJsonResponse(response) as { answer?: string; error?: string; code?: string };
  if (!response.ok || typeof payload.answer !== "string" || !payload.answer.trim()) {
    throw new Error(payload.code || "ASSISTANT_UNAVAILABLE");
  }
  return payload.answer.trim();
}
