"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { track } from "./analytics";

type Area = "Targeting" | "Application strength" | "Search consistency";

type Question = {
  area: Area;
  prompt: string;
};

const questions: Question[] = [
  { area: "Targeting", prompt: "Have you narrowed your search to one or two specific role types?" },
  { area: "Targeting", prompt: "Can you quickly tell whether a role matches your priorities?" },
  { area: "Targeting", prompt: "Do you separate must-have requirements from nice-to-haves?" },
  { area: "Targeting", prompt: "Can you explain why this role is the right next step for you?" },
  { area: "Targeting", prompt: "Are your location, salary, and work-style preferences clear?" },
  { area: "Application strength", prompt: "Can you explain why your experience fits this specific role?" },
  { area: "Application strength", prompt: "Does your résumé show outcomes and evidence—not only responsibilities?" },
  { area: "Application strength", prompt: "Do you compare your résumé with the job description before applying?" },
  { area: "Application strength", prompt: "Is your résumé structured so an ATS can read it cleanly?" },
  { area: "Application strength", prompt: "Can you tailor your story without rewriting everything from scratch?" },
  { area: "Search consistency", prompt: "Do you track every application, contact, and follow-up?" },
  { area: "Search consistency", prompt: "Do you follow up at a planned time instead of relying on memory?" },
  { area: "Search consistency", prompt: "Do you have a realistic weekly job-search routine?" },
  { area: "Search consistency", prompt: "Do you include thoughtful outreach alongside applications?" },
  { area: "Search consistency", prompt: "Do you practise interview stories before you are invited?" },
];

const options = ["Not yet", "Sometimes", "Usually", "Yes, clearly"] as const;
const areas: Area[] = ["Targeting", "Application strength", "Search consistency"];

const areaDescriptions: Record<Area, string> = {
  Targeting: "How clearly you have defined your goals and the right opportunities.",
  "Application strength": "How well your résumé, evidence, and story match the role.",
  "Search consistency": "How consistently you take action, follow up, and stay on track.",
};

function getResult(score: number) {
  if (score < 45) return {
    title: "Build the foundations first.",
    copy: "A clearer target and a simple repeatable routine will make every application easier to tailor.",
  };
  if (score < 75) return {
    title: "You have momentum. Now make it repeatable.",
    copy: "Your next gain will come from turning the parts that work into a consistent application system.",
  };
  return {
    title: "Your process is focused. Sharpen the evidence.",
    copy: "Keep the structure you have and strengthen the proof behind each role-specific application.",
  };
}

export default function ReadinessScorecard() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() => Array(questions.length).fill(null));
  const [complete, setComplete] = useState(false);

  const selected = answers[index];
  const progress = complete ? 100 : Math.round((index / questions.length) * 100);

  const scores = useMemo(() => areas.map((area) => {
    const areaAnswers = questions.flatMap((question, questionIndex) => question.area === area && answers[questionIndex] !== null ? [answers[questionIndex] as number] : []);
    const earned = areaAnswers.reduce((sum, answer) => sum + answer, 0);
    return { area, percent: areaAnswers.length ? Math.round((earned / (areaAnswers.length * 3)) * 100) : 0 };
  }), [answers]);

  const overall = Math.round(scores.reduce((sum, area) => sum + area.percent, 0) / scores.length);
  const result = getResult(overall);

  function choose(value: number) {
    setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? value : answer));
    if (index === 0 && answers.every((answer) => answer === null)) track("readiness_assessment_started");
  }

  function next() {
    if (selected === null) return;
    if (index === questions.length - 1) {
      setComplete(true);
      track("readiness_assessment_completed", { score: overall });
      return;
    }
    setIndex((current) => current + 1);
  }

  function restart() {
    setAnswers(Array(questions.length).fill(null));
    setIndex(0);
    setComplete(false);
  }

  return <section className="readiness-section shell" id="readiness" aria-labelledby="readiness-title">
    <header className="readiness-heading">
      <h2 id="readiness-title">How ready is your job search?</h2>
      <p>Answer 15 quick questions across three areas. Get a practical readiness snapshot and your next best step.</p>
    </header>

    <div className="readiness-layout">
      <div className="readiness-panel">
        {!complete ? <>
          <div className="readiness-progress-copy"><span>Question {index + 1} of {questions.length}</span><span>{progress}%</span></div>
          <div className="readiness-progress" aria-hidden="true"><span style={{ width: `${Math.max(progress, 4)}%` }} /></div>
          <fieldset className="readiness-question">
            <legend>{questions[index].prompt}</legend>
            <div className="readiness-options" role="radiogroup" aria-label="Choose the answer that best describes you">
              {options.map((option, optionIndex) => <button key={option} type="button" role="radio" aria-checked={selected === optionIndex} onClick={() => choose(optionIndex)}>
                <span aria-hidden="true" />{option}
              </button>)}
            </div>
          </fieldset>
          <div className="readiness-actions">
            <button type="button" className="readiness-back" disabled={index === 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>Back</button>
            <button type="button" className="readiness-next" disabled={selected === null} onClick={next}>{index === questions.length - 1 ? "See my readiness" : "Continue"}<span aria-hidden="true">→</span></button>
          </div>
        </> : <div className="readiness-result" aria-live="polite">
          <span>Your job-search readiness</span>
          <div className="readiness-score"><strong>{overall}</strong><small>/ 100</small></div>
          <h3>{result.title}</h3>
          <p>{result.copy}</p>
          <div className="readiness-breakdown">{scores.map(({ area, percent }) => <div key={area}><span>{area}</span><b>{percent}%</b><i aria-hidden="true"><span style={{ width: `${percent}%` }} /></i></div>)}</div>
          <div className="readiness-result-actions"><Link href="/job-fit-check">Check a real résumé against a role</Link><button type="button" onClick={restart}>Retake assessment</button></div>
        </div>}
      </div>

      <aside className="readiness-areas" aria-label="Readiness areas">
        <h3>Three areas for a stronger job search.</h3>
        <ol>{areas.map((area) => {
          const active = complete || questions[index].area === area;
          return <li key={area} className={active ? "active" : ""}><span aria-hidden="true" /><div><strong>{area}</strong><p>{areaDescriptions[area]}</p></div></li>;
        })}</ol>
        <p className="readiness-privacy"><span aria-hidden="true">⌁</span>No résumé upload needed · Takes about 3 minutes</p>
      </aside>
    </div>
  </section>;
}
