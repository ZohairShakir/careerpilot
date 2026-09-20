"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import PurchaseButton from "../purchase-button";
import { analyticsContext, track } from "../analytics";
import type { JobFitResult } from "../../lib/job-fit";

const MAX_CHARS = 40_000;
const MIN_RESUME_CHARS = 300;
const MIN_JOB_CHARS = 80;

function StatusIcon({ type }: { type: "demonstrated" | "unclear" | "missing" }) {
  const paths = { demonstrated: <path d="m5 12 4 4L19 6" />, unclear: <><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4" /><path d="M12 18h.01" /></>, missing: <><path d="m7 7 10 10" /><path d="m17 7-10 10" /></> };
  return <span className={`fit-status-icon ${type}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg></span>;
}

function LegacyResults({ result }: { result: JobFitResult }) {
  const readiness = { strong_alignment: "Strong alignment", possible_alignment: "Possible alignment", significant_gaps: "Significant gaps" }[result.readiness];
  return <section className="fit-results" aria-live="polite"><div className="fit-result-head"><div><span>Your result</span><h2>{result.roleTitle || "Role comparison"}</h2><p><b>{readiness}.</b> {result.summary}</p></div><aside><h3>No mystery percentage.</h3><p>The result is based on the requirements and the résumé evidence you supplied.</p></aside></div><div className="fit-requirements"><h3>Role requirements</h3><div><section><h4>Required</h4><ul>{result.requiredRequirements.map(item => <li key={item}>{item}</li>)}</ul></section><section><h4>Nice to have</h4><ul>{result.niceToHaveRequirements.map(item => <li key={item}>{item}</li>)}</ul></section></div></div><div className="fit-comparison"><h3>Résumé comparison</h3><p>Evidence first: what is clearly shown, what needs clarification, and what is not demonstrated.</p><div><section><h4><StatusIcon type="demonstrated" />Demonstrated</h4>{result.demonstrated.map(item => <article key={`${item.requirement}-${item.evidence}`}><strong>{item.requirement}</strong><blockquote>“{item.evidence}”</blockquote><p>{item.explanation}</p></article>)}</section><section><h4><StatusIcon type="unclear" />Unclear</h4>{result.unclear.map(item => <article key={item.requirement}><strong>{item.requirement}</strong><p>{item.explanation}</p></article>)}</section><section><h4><StatusIcon type="missing" />Missing</h4>{result.missing.map(item => <article key={item.requirement}><strong>{item.requirement}</strong><p>{item.explanation}</p></article>)}</section></div></div><div className="fit-improvements"><section><h3>Improve before you apply</h3><p>Focus on the changes that strengthen relevance without adding anything untrue.</p><ol>{result.improvements.map(item => <li key={`${item.priority}-${item.title}`}><span>{item.priority}</span><div><h4>{item.title}</h4><p>{item.reason}</p><b>{item.suggestion}</b></div></li>)}</ol><div className="fit-next-step"><strong>Recommended next step</strong><p>{result.nextStep}</p></div></section><aside><span>Take the next step</span><h3>Build the rest of your application system.</h3><p>Get the Blueprint, editable résumé template, Quick Start guide, 30-day plan, checklist, and tracker.</p><div onClick={() => track("job_fit_bundle_cta_clicked")}><PurchaseButton /></div></aside></div></section>;
}

function Results({ result }: { result: JobFitResult }) {
  const gapCount = result.unclear.length + result.missing.length;
  const verdict = {
    strong_alignment: gapCount ? `Strong fit, with ${gapCount} ${gapCount === 1 ? "area" : "areas"} to clarify before applying.` : "Strong fit. You appear ready to apply.",
    possible_alignment: `Good potential fit, with ${gapCount || "a few"} ${gapCount === 1 ? "area" : "areas"} to address before applying.`,
    significant_gaps: `${gapCount || "Several"} important ${gapCount === 1 ? "gap needs" : "gaps need"} attention before applying.`,
  }[result.readiness];
  const biggestGaps = [
    ...result.missing.map(item => ({ ...item, type: "missing" as const })),
    ...result.unclear.map(item => ({ ...item, type: "unclear" as const })),
  ].slice(0, 2);
  const topImprovements = result.improvements.slice(0, 3);

  return <section className="fit-results" aria-live="polite">
    <div className="fit-result-summary">
      <span>Your result</span>
      <h2>{result.roleTitle || "Role comparison"}</h2>
      <p className="fit-verdict">{verdict}</p>
      <div className="fit-counts" aria-label="Requirement summary">
        <div className="demonstrated"><StatusIcon type="demonstrated" /><strong>{result.demonstrated.length}</strong><span>demonstrated</span></div>
        <div className="unclear"><StatusIcon type="unclear" /><strong>{result.unclear.length}</strong><span>unclear</span></div>
        <div className="missing"><StatusIcon type="missing" /><strong>{result.missing.length}</strong><span>not demonstrated</span></div>
      </div>
    </div>

    <div className="fit-quick-grid">
      <section className="fit-biggest-gaps">
        <h3>What needs attention</h3>
        {biggestGaps.length ? <ol>{biggestGaps.map((item, index) => <li key={`${item.type}-${item.requirement}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{item.requirement}</h4><p>{item.explanation}</p></div></li>)}</ol> : <p className="fit-no-gaps">No major gaps were identified from the information provided.</p>}
      </section>
      <section className="fit-quick-fixes">
        <h3>Fix before you apply</h3>
        <ol>{topImprovements.map((item, index) => <li key={`${item.priority}-${item.title}`}><span>{index + 1}</span><div><h4>{item.title}</h4><p>{item.suggestion}</p></div></li>)}</ol>
      </section>
    </div>

    <aside className="fit-compact-cta">
      <div><h3>Ready to build the rest of your application?</h3><p>Six practical resources. One focused job-search system.</p></div>
      <div onClick={() => track("job_fit_bundle_cta_clicked")}><PurchaseButton label="Get the complete Career Pilot system → ₹499" /></div>
    </aside>

    <details className="fit-detail-disclosure">
      <summary><span>See detailed requirement-by-requirement analysis</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></summary>
      <div className="fit-detail-body">
        <div className="fit-detail-intro"><p>{result.summary}</p><strong>Recommended next step</strong><p>{result.nextStep}</p></div>
        <div className="fit-requirements"><h3>Role requirements</h3><div><section><h4>Required</h4><ul>{result.requiredRequirements.map(item => <li key={item}>{item}</li>)}</ul></section><section><h4>Nice to have</h4><ul>{result.niceToHaveRequirements.map(item => <li key={item}>{item}</li>)}</ul></section></div></div>
        <div className="fit-comparison"><h3>Résumé evidence</h3><p>What is clearly shown, what needs clarification, and what is not demonstrated.</p><div><section><h4><StatusIcon type="demonstrated" />Demonstrated</h4>{result.demonstrated.map(item => <article key={`${item.requirement}-${item.evidence}`}><strong>{item.requirement}</strong><blockquote>“{item.evidence}”</blockquote><p>{item.explanation}</p></article>)}</section><section><h4><StatusIcon type="unclear" />Unclear</h4>{result.unclear.map(item => <article key={item.requirement}><strong>{item.requirement}</strong><p>{item.explanation}</p></article>)}</section><section><h4><StatusIcon type="missing" />Not demonstrated</h4>{result.missing.map(item => <article key={item.requirement}><strong>{item.requirement}</strong><p>{item.explanation}</p></article>)}</section></div></div>
      </div>
    </details>
  </section>;
}

export default function JobFitCheck() {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<JobFitResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { track("job_fit_viewed"); }, []);

  function chooseFile(selected: File | null) {
    setError(""); setFile(selected);
    if (selected) track("resume_uploaded", { extension: selected.name.split(".").pop()?.toLowerCase() || "unknown", sizeKb: Math.round(selected.size / 1024) });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setResult(null);
    if (mode === "paste" && resumeText.trim().length < MIN_RESUME_CHARS) return setError("Paste at least 300 characters from your résumé so there is enough evidence to compare.");
    if (mode === "upload" && !file) return setError("Choose a PDF, DOCX, or TXT résumé.");
    if (jobDescription.trim().length < MIN_JOB_CHARS) return setError("Add one or two sentences about the role’s main responsibilities or required skills.");
    setLoading(true); track("job_fit_started", { resumeMethod: mode });
    const form = new FormData();
    if (mode === "paste") form.set("resumeText", resumeText); else if (file) form.set("resumeFile", file);
    form.set("jobDescription", jobDescription);
    form.set("sessionId", analyticsContext().sessionId);
    try {
      const response = await fetch("/api/job-fit", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The analysis could not be completed.");
      setResult(payload.result); track("job_fit_completed", { alignment: payload.result.readiness, resumeMethod: mode });
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The analysis could not be completed.";
      setError(message); track("job_fit_failed", { reason: message.slice(0, 100) });
    } finally { setLoading(false); }
  }

  return <div className="fit-tool shell"><header className="fit-hero"><div><h1>Know the fit before<br /><em>you apply.</em></h1><p>Compare your résumé with a job description and get a clear breakdown of what you demonstrate, what is unclear, what is not demonstrated, and what to improve.</p></div><ul><li>More informed applications</li><li>Stronger, more relevant résumés</li><li>A clearer path forward</li></ul></header><form className="fit-form" onSubmit={submit}><section><div className="fit-field-head"><h2>1. Your résumé</h2>{mode === "upload" ? <span>PDF, DOCX or TXT · 5 MB max</span> : <span>{resumeText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>}</div><div className="fit-modes" role="tablist" aria-label="Résumé input method"><button type="button" role="tab" aria-selected={mode === "paste"} onClick={() => { setMode("paste"); setFile(null); }}>Paste text</button><button type="button" role="tab" aria-selected={mode === "upload"} onClick={() => { setMode("upload"); setResumeText(""); }}>Upload file</button></div>{mode === "paste" ? <textarea aria-label="Résumé text" value={resumeText} onChange={event => { setResumeText(event.target.value.slice(0, MAX_CHARS)); setError(""); }} placeholder="Paste your résumé text here…" /> : <label className={`fit-upload ${file ? "has-file" : ""}`}><input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={event => chooseFile(event.target.files?.[0] || null)} /><strong>{file ? file.name : "Choose your résumé file"}</strong><span>{file ? `${Math.round(file.size / 1024)} KB · Click to replace` : "PDF, DOCX or TXT · maximum 5 MB"}</span></label>}</section><section><div className="fit-field-head"><h2>2. Job description</h2><span className={jobDescription.length > 0 && jobDescription.trim().length < MIN_JOB_CHARS ? "needs-detail" : ""}>{jobDescription.trim().length < MIN_JOB_CHARS ? `${jobDescription.length.toLocaleString()} / ${MIN_JOB_CHARS} minimum` : `${jobDescription.length.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`}</span></div><textarea aria-label="Job description" aria-describedby="job-description-help" value={jobDescription} onChange={event => { setJobDescription(event.target.value.slice(0, MAX_CHARS)); setError(""); }} placeholder="Paste the job listing or add a short role summary…" /><p className="fit-field-help" id="job-description-help">A couple of sentences about the responsibilities or required skills is enough.</p></section><div className="fit-submit"><button className="buy-button" disabled={loading}><span>{loading ? "Analyzing the evidence…" : "Check my job fit"}</span><span className="fit-submit-arrow" aria-hidden="true">→</span></button><p>Your documents are processed to create this analysis and are not stored. Remove sensitive personal information before uploading.</p>{error ? <p className="form-error" role="alert">{error}</p> : null}</div></form><div ref={resultsRef}>{result ? <Results result={result} /> : null}</div></div>;
}
