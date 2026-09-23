"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PurchaseButton from "../purchase-button";
import { analyticsContext, track } from "../analytics";
import type { JobFitResult } from "../../lib/job-fit";

const MAX_CHARS = 40_000;
const MIN_RESUME_CHARS = 300;
const MIN_JOB_CHARS = 80;
type JobInputMode = "job_description" | "role_title" | "job_url";
type LeadDetails = { name: string; email: string; marketingConsent: boolean };

function StatusIcon({ type }: { type: "demonstrated" | "unclear" | "missing" }) {
  const paths = { demonstrated: <path d="m5 12 4 4L19 6" />, unclear: <><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4" /><path d="M12 18h.01" /></>, missing: <><path d="m7 7 10 10" /><path d="m17 7-10 10" /></> };
  return <span className={`fit-status-icon ${type}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg></span>;
}

function LeadCaptureModal({ analysisReady, saving, error, onClose, onSubmit }: { analysisReady: boolean; saving: boolean; error: string; onClose: () => void; onSubmit: (details: LeadDetails) => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({ name: String(data.get("name") || "").trim(), email: String(data.get("email") || "").trim(), marketingConsent: data.get("marketingConsent") === "on" });
  }

  return createPortal(<div className="lead-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title"><button className="lead-modal-close" type="button" aria-label="Close" onClick={onClose}>×</button><div className="lead-modal-form"><span>{analysisReady ? "Your analysis is ready" : "Analysis in progress"}</span><h2 id="lead-modal-title">Your analysis is being prepared.</h2><p>Tell us who this result belongs to. We’ll also use these details to prefill checkout if you decide to continue.</p><form onSubmit={submit}><label>First name<input name="name" autoComplete="given-name" required minLength={2} maxLength={120} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={160} /></label><label className="lead-consent"><input name="marketingConsent" type="checkbox" /><span>Send me occasional practical job-search guidance and Career Pilot updates.</span></label><button className="buy-button" disabled={saving}>{saving ? "Saving your details…" : "Continue to my analysis"}</button>{error ? <p className="form-error" role="alert">{error}</p> : null}<small>Your résumé and job description are processed for this analysis and are not stored. <a href="/privacy" target="_blank">Privacy policy ↗</a></small></form></div><aside className="lead-modal-offer"><div className="lead-offer-price"><span>₹499</span><b>₹399</b><em>20% OFF</em></div><span>Exclusive after your Job Fit Check</span><h3>Know what to fix.<br /><em>Then build the system.</em></h3><p>Six practical resources for clarifying your evidence, tailoring applications and building a repeatable job-search routine.</p><ul><li>Blueprint and 50 prompts</li><li>AI-ready résumé template</li><li>Quick Start application guide</li><li>30-day plan, checklist and tracker</li></ul><small>You’ll see your complete analysis before deciding whether to buy.</small></aside></section></div>, document.body);
}

function Results({ result, offerToken, leadDetails }: { result: JobFitResult; offerToken: string | null; leadDetails: LeadDetails }) {
  const offerRef = useRef<HTMLElement>(null);
  const gapCount = result.unclear.length + result.missing.length;
  const verdict = {
    strong_alignment: gapCount ? `Strong fit, with ${gapCount} ${gapCount === 1 ? "area" : "areas"} to address before applying.` : "Strong fit. You appear ready to apply.",
    possible_alignment: `Good potential fit, with ${gapCount || "a few"} ${gapCount === 1 ? "area" : "areas"} to address before applying.`,
    significant_gaps: `${gapCount || "Several"} important ${gapCount === 1 ? "gap needs" : "gaps need"} attention before applying.`,
  }[result.readiness];
  const topImprovements = result.improvements.slice(0, 3);
  const attentionItems = [
    ...result.missing.map(item => ({ ...item, type: "missing" as const })),
    ...result.unclear.map(item => ({ ...item, type: "unclear" as const })),
  ].slice(0, 3);
  const evidenceGroups = [
    { key: "demonstrated", title: "Demonstrated", items: result.demonstrated.slice(0, 3), empty: "No requirements were clearly demonstrated from the supplied résumé." },
    { key: "unclear", title: "Unclear", items: result.unclear.slice(0, 3), empty: "No unclear requirements were identified." },
    { key: "missing", title: "Not demonstrated", items: result.missing.slice(0, 3), empty: "No important requirements were absent from the supplied résumé." },
  ] as const;
  const offerCopy = result.missing.length
    ? "Your analysis found a few areas that need attention. Use the system to assess, tailor and strengthen your application before applying."
    : result.unclear.length
      ? "You have relevant experience to work with. Now use the system to communicate it more clearly."
      : "Your resume already demonstrates most of what this role asks for. The next step is making that evidence as clear and targeted as possible.";

  useEffect(() => {
    track("result_viewed", { alignment: result.readiness, analysisMode: result.analysisMode });
    const element = offerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { track("paid_offer_viewed", { alignment: result.readiness }); track("offer_viewed_after_lead", { alignment: result.readiness }); observer.disconnect(); }
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [result.analysisMode, result.readiness]);

  return <section className="fit-results" aria-live="polite">
    <div className="fit-result-summary">
      <span>{result.analysisMode === "role_title" ? "Role-based analysis" : "Based on this job description"}</span>
      <h2>{result.roleTitle || "Role comparison"}</h2>
      {result.analysisMode === "role_title" ? <p className="fit-source-note">This uses common requirements for the role—not requirements from a specific employer.</p> : null}
      <p className="fit-verdict">{verdict}</p>
      <div className="fit-counts" aria-label="Requirement summary">
        <div className="demonstrated"><StatusIcon type="demonstrated" /><strong>{result.demonstrated.length}</strong><span>demonstrated</span></div>
        <div className="unclear"><StatusIcon type="unclear" /><strong>{result.unclear.length}</strong><span>unclear</span></div>
        <div className="missing"><StatusIcon type="missing" /><strong>{result.missing.length}</strong><span>not demonstrated</span></div>
      </div>
    </div>

    <section className="fit-evidence-snapshot">
      <div className="fit-section-heading"><h3>Your evidence at a glance</h3><p>The most important requirements from this role, compared with what your résumé actually shows.</p></div>
      <div>{evidenceGroups.map(group => <section key={group.key}><h4><StatusIcon type={group.key} />{group.title}</h4>{group.items.length ? <ul>{group.items.map(item => <li key={`${group.key}-${item.requirement}`}><strong>{item.requirement}</strong><p>{item.explanation}</p></li>)}</ul> : <p className="fit-empty-evidence">{group.empty}</p>}</section>)}</div>
    </section>

    <div className="fit-quick-grid">
      <section className="fit-biggest-gaps">
        <h3>What needs attention</h3>
        {attentionItems.length ? <ol>{attentionItems.map((item, index) => <li key={`${item.type}-${item.requirement}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{item.requirement}</h4><p>{item.explanation}</p></div></li>)}</ol> : <p className="fit-no-gaps">No major unclear or not-demonstrated requirements were identified.</p>}
      </section>
      <section className="fit-quick-fixes">
        <h3>Before you apply</h3>
        <p>Focus on these changes first. Only add skills or experience you can genuinely support.</p>
        <ol>{topImprovements.map((item, index) => <li key={`${item.priority}-${item.title}`}><span>{index + 1}</span><div><h4>{item.title}</h4><p>{item.suggestion}</p></div></li>)}</ol>
      </section>
    </div>

    <aside className="fit-paid-offer" ref={offerRef}>
      <div className="fit-offer-copy"><span>Your Job Fit Check offer</span><h3>You know what needs attention. Now fix it.</h3><p>{offerCopy}</p><p>Career Pilot gives you the prompts, templates, checklist, tracker and 30-day plan to turn your job-search process into a repeatable system.</p></div>
      <div className="fit-offer-details"><ol><li>The AI Job Search Blueprint</li><li>Quick Start: Your First AI-Powered Job Application</li><li>30-Day AI Job Search Implementation Plan</li><li>AI-Ready Resume Template</li><li>AI Job Search Checklist</li><li>Job Application Tracker</li></ol>{offerToken ? <div className="fit-offer-price"><span>₹499</span><b>₹399</b><em>20% OFF</em></div> : <div className="fit-offer-price"><b>₹499</b></div>}<div onClick={() => track("job_fit_bundle_cta_clicked")}><PurchaseButton source="job_fit_offer" offerToken={offerToken} offerPrice={offerToken ? 399 : undefined} prefillName={leadDetails.name} prefillEmail={leadDetails.email} label="Get the Career Pilot System" /></div><small>{offerToken ? "Exclusive to completed Job Fit Checks · " : ""}Secure Razorpay checkout</small></div>
    </aside>

    <details className="fit-detail-disclosure">
      <summary><span>See detailed requirement-by-requirement analysis</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></summary>
      <div className="fit-detail-body">
        <div className="fit-detail-intro"><p>{result.summary}</p><strong>Recommended next step</strong><p>{result.nextStep}</p></div>
        <div className="fit-requirements"><h3>{result.analysisMode === "role_title" ? "Inferred role requirements" : "Role requirements"}</h3><div><section><h4>Common / core</h4><ul>{result.commonRequirements.map(item => <li key={item}>{item}</li>)}</ul></section><section><h4>Often requested</h4><ul>{result.oftenRequestedRequirements.map(item => <li key={item}>{item}</li>)}</ul></section><section><h4>Nice to have</h4><ul>{result.niceToHaveRequirements.map(item => <li key={item}>{item}</li>)}</ul></section></div></div>
        <div className="fit-comparison"><h3>Résumé evidence</h3><p>What is clearly shown, what needs clarification, and what is not demonstrated.</p><div><section><h4><StatusIcon type="demonstrated" />Demonstrated</h4>{result.demonstrated.map(item => <article key={`${item.requirement}-${item.evidence}`}><strong>{item.requirement}</strong><blockquote>“{item.evidence}”</blockquote><p>{item.explanation}</p></article>)}</section><section><h4><StatusIcon type="unclear" />Unclear</h4>{result.unclear.map(item => <article key={item.requirement}><strong>{item.requirement}</strong><p>{item.explanation}</p></article>)}</section><section><h4><StatusIcon type="missing" />Not demonstrated</h4>{result.missing.map(item => <article key={item.requirement}><strong>{item.requirement}</strong><p>{item.explanation}</p></article>)}</section></div></div>
      </div>
    </details>
  </section>;
}

export default function JobFitCheck() {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [jobInputMode, setJobInputMode] = useState<JobInputMode>("job_description");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<JobFitResult | null>(null);
  const [offerToken, setOfferToken] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState("");
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const revealedAnalysisRef = useRef("");

  useEffect(() => { track("job_fit_viewed"); }, []);

  useEffect(() => {
    if (!result || !leadSubmitted || !analysisId || revealedAnalysisRef.current === analysisId) return;
    revealedAnalysisRef.current = analysisId;
    track("result_revealed", { alignment: result.readiness, analysisMode: result.analysisMode });
    void fetch("/api/job-fit/lead", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysisId, alignment: result.readiness, roleTitle: result.roleTitle, status: "completed" }) });
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [analysisId, leadSubmitted, result]);

  function chooseFile(selected: File | null) {
    setError(""); setFile(selected);
    if (selected) track("resume_uploaded", { extension: selected.name.split(".").pop()?.toLowerCase() || "unknown", sizeKb: Math.round(selected.size / 1024) });
  }

  function closeLeadModal() {
    if (!leadSubmitted) track("lead_modal_abandoned", { analysisReady: Boolean(result) });
    setLeadModalOpen(false);
  }

  async function submitLead(details: LeadDetails) {
    setLeadSaving(true); setLeadError("");
    try {
      const context = analyticsContext();
      const response = await fetch("/api/job-fit/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysisId, sessionId: context.sessionId, ...details, inputMode: jobInputMode, roleTitle: result?.roleTitle || jobTitle, alignment: result?.readiness }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "We could not save your details.");
      setLeadDetails(details); setLeadSubmitted(true); setLeadModalOpen(false);
      track("job_fit_lead_submitted", { inputMode: jobInputMode, analysisReady: Boolean(result) });
      if (details.marketingConsent) track("marketing_consent_given");
    } catch (caught) { setLeadError(caught instanceof Error ? caught.message : "We could not save your details. Please try again."); }
    finally { setLeadSaving(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setResult(null); setOfferToken(null); setLeadSubmitted(false); setLeadDetails(null); setLeadError("");
    if (mode === "paste" && resumeText.trim().length < MIN_RESUME_CHARS) return setError("Paste at least 300 characters from your résumé so there is enough evidence to compare.");
    if (mode === "upload" && !file) return setError("Choose a PDF, DOCX, or TXT résumé.");
    if (jobInputMode === "job_description" && jobDescription.trim().length < MIN_JOB_CHARS) return setError("Add one or two sentences about the role’s main responsibilities or required skills.");
    const normalizedTitle = jobTitle.trim().toLowerCase();
    const vagueTitles = new Set(["developer", "engineer", "manager", "analyst", "designer", "intern", "specialist", "consultant", "associate", "executive"]);
    if (jobInputMode === "role_title" && !normalizedTitle) return setError("Enter the job title you want to assess.");
    if (jobInputMode === "role_title" && vagueTitles.has(normalizedTitle)) return setError("Try something more specific, like Full Stack Developer, Data Analyst, Product Designer, or Marketing Intern.");
    const nextAnalysisId = crypto.randomUUID();
    setAnalysisId(nextAnalysisId); setLoading(true); setLeadModalOpen(true);
    track("lead_modal_viewed", { jobInputMode });
    track("job_fit_started", { resumeMethod: mode, jobInputMode });
    track(jobInputMode === "role_title" ? "role_title_analysis_used" : "job_description_analysis_used");
    const form = new FormData();
    if (mode === "paste") form.set("resumeText", resumeText); else if (file) form.set("resumeFile", file);
    form.set("jobInputType", jobInputMode);
    if (jobInputMode === "role_title") form.set("jobTitle", jobTitle); else form.set("jobDescription", jobDescription);
    form.set("sessionId", analyticsContext().sessionId);
    try {
      const response = await fetch("/api/job-fit", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The analysis could not be completed.");
      setResult(payload.result); setOfferToken(payload.offerToken || null);
      track("job_fit_completed", { alignment: payload.result.readiness, resumeMethod: mode, jobInputMode });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The analysis could not be completed.";
      setError(message); track("job_fit_failed", { reason: message.slice(0, 100) });
      setLeadModalOpen(false);
      if (leadSubmitted) void fetch("/api/job-fit/lead", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysisId: nextAnalysisId, status: "failed" }) });
    } finally { setLoading(false); }
  }

  return <div className="fit-tool shell">
    <header className="fit-hero"><div><h1>Free Job Fit Checker</h1><p>Compare your resume with a specific job description—or use a job title for a transparent role-based analysis. See what you demonstrate, what is unclear, and what is not demonstrated.</p></div><ul><li>Evidence behind every resume match</li><li>Specific or role-based requirements</li><li>No arbitrary ATS percentage</li></ul></header>
    <form className="fit-form" onSubmit={submit}>
      <section>
        <div className="fit-field-head"><h2>1. Your résumé</h2>{mode === "upload" ? <span>PDF, DOCX or TXT · 5 MB max</span> : <span>{resumeText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>}</div>
        <div className="fit-modes" role="tablist" aria-label="Résumé input method"><button type="button" role="tab" aria-selected={mode === "paste"} onClick={() => { setMode("paste"); setFile(null); }}>Paste text</button><button type="button" role="tab" aria-selected={mode === "upload"} onClick={() => { setMode("upload"); setResumeText(""); }}>Upload file</button></div>
        {mode === "paste" ? <textarea aria-label="Résumé text" value={resumeText} onChange={event => { setResumeText(event.target.value.slice(0, MAX_CHARS)); setError(""); }} placeholder="Paste your résumé text here…" /> : <label className={`fit-upload ${file ? "has-file" : ""}`}><input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={event => chooseFile(event.target.files?.[0] || null)} /><strong>{file ? file.name : "Choose your résumé file"}</strong><span>{file ? `${Math.round(file.size / 1024)} KB · Click to replace` : "PDF, DOCX or TXT · maximum 5 MB"}</span></label>}
      </section>
      <section>
        <div className="fit-field-head"><h2>2. Job target</h2>{jobInputMode === "job_description" ? <span className={jobDescription.length > 0 && jobDescription.trim().length < MIN_JOB_CHARS ? "needs-detail" : ""}>{jobDescription.trim().length < MIN_JOB_CHARS ? `${jobDescription.length.toLocaleString()} / ${MIN_JOB_CHARS} minimum` : `${jobDescription.length.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`}</span> : jobInputMode === "role_title" ? <span>{jobTitle.length} / 120</span> : null}</div>
        <div className="fit-modes fit-job-modes" role="tablist" aria-label="Job input method"><button type="button" role="tab" aria-selected={jobInputMode === "job_description"} onClick={() => { setJobInputMode("job_description"); setError(""); }}>Full job description</button><button type="button" role="tab" aria-selected={jobInputMode === "role_title"} onClick={() => { setJobInputMode("role_title"); setError(""); }}>Job title / role</button><button type="button" role="tab" aria-selected="false" disabled>Job URL <small>Later</small></button></div>
        {jobInputMode === "job_description" ? <><textarea aria-label="Job description" aria-describedby="job-description-help" value={jobDescription} onChange={event => { setJobDescription(event.target.value.slice(0, MAX_CHARS)); setError(""); }} placeholder="Paste the job listing or add a short role summary…" /><p className="fit-field-help" id="job-description-help">A couple of sentences about the responsibilities or required skills is enough.</p></> : <div className="fit-role-input"><label htmlFor="job-title">Job title</label><input id="job-title" value={jobTitle} maxLength={120} onChange={event => { setJobTitle(event.target.value); setError(""); }} placeholder="e.g. Full Stack Developer" /><p>We’ll compare your résumé with common requirements for this role—not a specific employer’s job description.</p></div>}
      </section>
      <div className="fit-submit"><button className="buy-button" disabled={loading}><span>{loading ? "Analyzing the evidence…" : "Check my job fit"}</span><span className="fit-submit-arrow" aria-hidden="true">→</span></button><p>Free analysis · Name and email required · Your documents are not stored.</p>{error ? <p className="form-error" role="alert">{error}</p> : null}</div>
    </form>
    {!leadSubmitted && !leadModalOpen && (loading || result) ? <div className="fit-lead-return"><p>{result ? "Your analysis is ready." : "Your analysis is still being prepared."}</p><button type="button" className="buy-button" onClick={() => { setLeadModalOpen(true); track("lead_modal_viewed", { reopened: true }); }}>Continue to my analysis</button></div> : null}
    <div ref={resultsRef}>{result && leadSubmitted && leadDetails ? <Results result={result} offerToken={offerToken} leadDetails={leadDetails} /> : null}</div>
    {leadModalOpen ? <LeadCaptureModal analysisReady={Boolean(result)} saving={leadSaving} error={leadError} onClose={closeLeadModal} onSubmit={submitLead} /> : null}
  </div>;
}
