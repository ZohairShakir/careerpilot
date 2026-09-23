import { NextResponse } from "next/server";
import { bestEffort, supabaseRequest } from "../../../../lib/supabase";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALIGNMENTS = new Set(["strong_alignment", "possible_alignment", "significant_gaps"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!UUID.test(String(body.analysisId || "")) || !UUID.test(String(body.sessionId || ""))) return NextResponse.json({ error: "This analysis session is invalid. Please try again." }, { status: 400 });
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (name.length < 2 || name.length > 120 || !EMAIL.test(email) || email.length > 160) return NextResponse.json({ error: "Enter a valid name and email address." }, { status: 400 });
    const inputMode = body.inputMode === "role_title" ? "role_title" : "job_description";
    const marketingConsent = body.marketingConsent === true;
    const alignment = ALIGNMENTS.has(body.alignment) ? body.alignment : null;
    await supabaseRequest("job_fit_leads?on_conflict=analysis_id", {
      method: "POST",
      body: JSON.stringify({
        analysis_id: body.analysisId,
        session_id: body.sessionId,
        name,
        email,
        input_mode: inputMode,
        role_title: String(body.roleTitle || "").trim().slice(0, 120) || null,
        analysis_status: alignment ? "completed" : "started",
        alignment,
        marketing_consent: marketingConsent,
        consented_at: marketingConsent ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }),
    }, "resolution=merge-duplicates");
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Job Fit lead capture failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We could not save your details. Please try again." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!UUID.test(String(body.analysisId || ""))) return NextResponse.json({ error: "Invalid analysis session." }, { status: 400 });
    const alignment = ALIGNMENTS.has(body.alignment) ? body.alignment : null;
    const status = body.status === "failed" ? "failed" : alignment ? "completed" : "started";
    await bestEffort(() => supabaseRequest(`job_fit_leads?analysis_id=eq.${encodeURIComponent(body.analysisId)}`, { method: "PATCH", body: JSON.stringify({ analysis_status: status, alignment, role_title: String(body.roleTitle || "").trim().slice(0, 120) || null, updated_at: new Date().toISOString() }) }));
    return new NextResponse(null, { status: 204 });
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
}
