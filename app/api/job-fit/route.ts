import { NextResponse } from "next/server";
import { analysisInstructions, extractResumeText, fingerprint, jobFitSchema, MAX_TEXT_CHARS, MIN_JOB_DESCRIPTION_CHARS, MIN_TEXT_CHARS, normalizeText, redactContactDetails, type JobFitResult } from "../../../lib/job-fit";
import { bestEffort, supabaseRequest } from "../../../lib/supabase";
import { createJobFitOfferToken } from "../../../lib/job-fit-offer";

export const runtime = "nodejs";
export const maxDuration = 60;

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  error?: { message?: string };
};

async function startRun(sessionId: string | null, visitorFingerprint: string, resumeMethod: string, resumeChars: number, jdChars: number) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return crypto.randomUUID();
  const result = await supabaseRequest<string>("rpc/start_job_fit_run", { method: "POST", body: JSON.stringify({ p_session_id: sessionId, p_fingerprint: visitorFingerprint, p_resume_method: resumeMethod, p_resume_chars: resumeChars, p_job_description_chars: jdChars }) });
  return result;
}

export async function POST(request: Request) {
  let runId: string | null = null;
  const startedAt = Date.now();
  try {
    if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Job Fit Check is not configured yet." }, { status: 503 });
    const form = await request.formData();
    const rawPastedResume = String(form.get("resumeText") || "");
    const jobInputType = form.get("jobInputType") === "role_title" ? "role_title" : "job_description";
    const rawJobDescription = String(form.get("jobDescription") || "");
    const rawJobTitle = String(form.get("jobTitle") || "");
    if (rawPastedResume.length > MAX_TEXT_CHARS || rawJobDescription.length > MAX_TEXT_CHARS || rawJobTitle.length > 120) {
      return NextResponse.json({ error: "Keep each text field under 40,000 characters." }, { status: 400 });
    }
    const pastedResume = normalizeText(rawPastedResume);
    const jobDescription = normalizeText(rawJobDescription);
    const jobTitle = normalizeText(rawJobTitle).slice(0, 120);
    const sessionIdValue = String(form.get("sessionId") || "");
    const sessionId = /^[0-9a-f-]{36}$/i.test(sessionIdValue) ? sessionIdValue : null;
    const fileValue = form.get("resumeFile");
    const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    if (!pastedResume && !file) return NextResponse.json({ error: "Paste your résumé or upload a file." }, { status: 400 });
    if (pastedResume && file) return NextResponse.json({ error: "Use either pasted résumé text or an uploaded file, not both." }, { status: 400 });
    if (jobInputType === "job_description" && jobDescription.length < MIN_JOB_DESCRIPTION_CHARS) return NextResponse.json({ error: "Add a short summary of the role, including its main responsibilities or required skills." }, { status: 400 });
    const vagueTitles = new Set(["developer", "engineer", "manager", "analyst", "designer", "intern", "specialist", "consultant", "associate", "executive"]);
    if (jobInputType === "role_title" && (!jobTitle || jobTitle.length < 4)) return NextResponse.json({ error: "Enter the job title you want to assess." }, { status: 400 });
    if (jobInputType === "role_title" && vagueTitles.has(jobTitle.toLowerCase())) return NextResponse.json({ error: "Try something more specific, like Full Stack Developer, Data Analyst, Product Designer, or Marketing Intern." }, { status: 400 });

    const resumeText = file ? await extractResumeText(file) : pastedResume;
    if (resumeText.length < MIN_TEXT_CHARS) return NextResponse.json({ error: "We could not find enough readable résumé text. Try pasting the text instead." }, { status: 400 });
    const resumeMethod = file ? file.name.toLowerCase().split(".").pop() || "file" : "paste";
    const jobInput = jobInputType === "role_title" ? jobTitle : jobDescription;
    runId = await startRun(sessionId, fingerprint(request), resumeMethod, resumeText.length, jobInput.length);
    if (!runId) return NextResponse.json({ error: "You have reached today’s free analysis limit. Please try again tomorrow." }, { status: 429 });

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const requestBody = JSON.stringify({
        systemInstruction: { parts: [{ text: analysisInstructions }] },
        contents: [{ role: "user", parts: [{ text: jobInputType === "role_title"
          ? `JOB INPUT MODE: ROLE TITLE\nThe following is only a role title. Build a conservative role-based profile and do not imply knowledge of a specific employer.\n<role_title>\n${jobTitle}\n</role_title>\n\nRESUME DATA:\n<resume>\n${redactContactDetails(resumeText)}\n</resume>`
          : `JOB INPUT MODE: JOB DESCRIPTION\nRESUME DATA:\n<resume>\n${redactContactDetails(resumeText)}\n</resume>\n\nJOB DESCRIPTION DATA:\n<job_description>\n${jobDescription}\n</job_description>` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: jobFitSchema,
          temperature: 0.2,
          maxOutputTokens: 6_144,
        },
      });
    const callModel = async (modelName: string) => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`, {
        method: "POST",
        signal: AbortSignal.timeout(50_000),
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY!, "Content-Type": "application/json" },
        body: requestBody,
      });
      return { response, payload: await response.json() as GeminiResponse };
    };
    let generated = await callModel(model);
    if ([429, 503].includes(generated.response.status) && model !== "gemini-2.5-flash") generated = await callModel("gemini-2.5-flash");
    const { response, payload } = generated;
    const outputText = payload.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
    if (!response.ok || !outputText) {
      const reason = payload.error?.message || payload.promptFeedback?.blockReason || payload.candidates?.[0]?.finishReason;
      throw new Error(reason || "The analysis service did not return a result.");
    }
    const parsed = JSON.parse(outputText) as Omit<JobFitResult, "analysisMode">;
    const result: JobFitResult = { ...parsed, analysisMode: jobInputType };
    await bestEffort(() => supabaseRequest(`job_fit_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({ status: "completed", alignment: result.readiness, duration_ms: Date.now() - startedAt, input_tokens: payload.usageMetadata?.promptTokenCount || null, output_tokens: payload.usageMetadata?.candidatesTokenCount || null, completed_at: new Date().toISOString() }) }));
    return NextResponse.json({ result, offerToken: createJobFitOfferToken() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The analysis could not be completed.";
    if (runId) await bestEffort(() => supabaseRequest(`job_fit_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({ status: "failed", error_code: message.slice(0, 120), duration_ms: Date.now() - startedAt, completed_at: new Date().toISOString() }) }));
    console.error("Job fit analysis failed", message);
    return NextResponse.json({ error: "We could not complete the analysis. Please check the files and try again." }, { status: 500 });
  }
}
