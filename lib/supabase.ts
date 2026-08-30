const baseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function analyticsConfigured() {
  return Boolean(baseUrl && serviceKey);
}

export async function supabaseRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
  prefer?: string,
): Promise<T | null> {
  if (!baseUrl || !serviceKey) return null;
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) as T : null;
}

export async function bestEffort(task: () => Promise<unknown>) {
  try { await task(); } catch (error) {
    console.error("Analytics persistence failed", error instanceof Error ? error.message : error);
  }
}
