export type Article = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  readTime: string;
  sections: { heading: string; paragraphs?: string[]; steps?: string[] }[];
};

export const articles: Article[] = [
  {
    slug: "how-to-use-ai-for-job-search",
    title: "How to Use AI in Your Job Search Without Losing Your Voice",
    description: "A practical, honest workflow for using AI to choose roles, improve applications, prepare for interviews, and stay consistent.",
    eyebrow: "AI job-search guide",
    readTime: "7 min read",
    sections: [
      { heading: "The useful role of AI", paragraphs: ["AI works best as a thinking partner, editor, and practice partner. It can help you uncover patterns in your experience, understand a role, organize evidence, and improve clarity. It should not invent qualifications, achievements, responsibilities, or numbers.", "That distinction matters. A polished application built on false information is not a stronger application. The goal is to communicate your real value more clearly."] },
      { heading: "Start with your evidence", steps: ["List the work you have actually done, including projects, responsibilities, tools, and outcomes.", "Identify transferable skills and the kinds of problems you solve well.", "Save real examples, feedback, and measurable results before asking AI to rewrite anything."] },
      { heading: "Use AI across the whole search", paragraphs: ["Most people use AI only when they need a résumé or cover letter. A better system uses it earlier and later too: choosing realistic target roles, decoding job descriptions, finding gaps, tailoring applications, preparing outreach, practising interviews, evaluating offers, and reviewing progress."] },
      { heading: "A simple quality check", steps: ["Is every claim true and supported by your experience?", "Does the answer respond to this specific role rather than any role?", "Would you be comfortable explaining every line in an interview?", "Does the final version still sound like you?"] },
    ],
  },
  {
    slug: "ai-resume-prompts",
    title: "AI Résumé Prompts That Produce Specific, Truthful Results",
    description: "Learn how to prompt AI to audit, strengthen, and tailor your résumé without fabricating experience or stuffing keywords.",
    eyebrow: "Résumé guide",
    readTime: "6 min read",
    sections: [
      { heading: "Give AI facts before asking for prose", paragraphs: ["Generic inputs create generic résumé advice. Provide your current résumé, the target job description, and a short evidence bank containing real projects, tools, responsibilities, outcomes, and constraints."] },
      { heading: "Four jobs your prompt should do", steps: ["Audit: identify unclear, irrelevant, repetitive, or unsupported content.", "Extract: separate the job description into responsibilities, required skills, tools, and terminology.", "Match: connect each requirement to genuine evidence from your experience.", "Rewrite: improve clarity and impact while preserving facts and your natural voice."] },
      { heading: "Never ask AI to fill the gaps", paragraphs: ["If a job asks for something you have not done, label it as a gap. Decide whether it is critical, important, or merely nice to have. You can then learn it, demonstrate adjacent experience, or focus on roles with a better fit."] },
      { heading: "Final résumé review", steps: ["Check names, dates, job titles, and numbers manually.", "Remove claims you cannot explain with a real example.", "Use relevant terminology naturally; do not repeat keywords for their own sake.", "Keep formatting readable for both recruiters and applicant-tracking systems."] },
    ],
  },
  {
    slug: "tailor-resume-to-job-description",
    title: "How to Tailor Your Résumé to a Job Description",
    description: "A repeatable process for finding the role’s priorities and connecting them to evidence already present in your experience.",
    eyebrow: "Application strategy",
    readTime: "8 min read",
    sections: [
      { heading: "Tailoring is selection, not invention", paragraphs: ["You are not creating a new professional identity for every application. You are selecting and emphasizing the parts of your real experience that are most relevant to a particular employer."] },
      { heading: "Decode the job description", steps: ["Separate essential requirements from preferred ones.", "Highlight repeated responsibilities, skills, tools, and industry language.", "Summarize the three problems this person is being hired to solve.", "Note evidence the employer is likely to look for during screening."] },
      { heading: "Build an evidence map", paragraphs: ["For every important requirement, find a project, responsibility, achievement, or transferable skill that supports it. If there is no evidence, leave it as a gap rather than forcing a match."] },
      { heading: "Make the highest-value edits first", steps: ["Adjust the professional summary to reflect the role and your strongest relevant evidence.", "Reorder skills so the most relevant genuine skills are easiest to find.", "Strengthen experience bullets that prove the employer’s priorities.", "Remove low-value detail that distracts from the fit.", "Run a final truth, clarity, grammar, and consistency check."] },
    ],
  },
  {
    slug: "7-day-job-search-plan",
    title: "A Practical 7-Day AI Job Search Plan",
    description: "Turn an overwhelming job search into seven focused days covering direction, résumé, LinkedIn, applications, networking, and interviews.",
    eyebrow: "Weekly plan",
    readTime: "6 min read",
    sections: [
      { heading: "Day 1: Know your value", paragraphs: ["Define your transferable skills, professional strengths, useful achievements, differentiator, and positioning. The goal is a clear answer to: what do I bring to the table?"] },
      { heading: "Day 2: Find your target", paragraphs: ["Choose realistic strong-match, adjacent, and stretch roles. Decode a few real job descriptions, score your fit, and identify the gaps that matter most."] },
      { heading: "Day 3: Build your résumé", paragraphs: ["Audit the current document, strengthen the summary and experience sections, find honest metrics, and build a targeted master version."] },
      { heading: "Day 4: Build your presence", paragraphs: ["Align your LinkedIn headline, About section, experience, skills, and keywords with the same professional story your résumé tells."] },
      { heading: "Day 5: Start applying", paragraphs: ["Choose two or three relevant jobs. Tailor each application, answer questions directly, and complete a final quality check before submitting."] },
      { heading: "Day 6: Start networking", paragraphs: ["Identify recruiters, hiring managers, team members, alumni, and industry professionals. Begin genuine conversations with short, specific messages."] },
      { heading: "Day 7: Build momentum", paragraphs: ["Prepare likely interview questions, practise evidence-led answers, create follow-up messages, and set a realistic weekly rhythm for applications, outreach, interviews, and review."] },
    ],
  },
  {
    slug: "ats-friendly-resume-format-for-freshers",
    title: "An ATS-Friendly Résumé Format for Freshers",
    description: "Build a clear, truthful fresher résumé that is easy for applicant-tracking systems and recruiters to understand.",
    eyebrow: "Fresher résumé guide",
    readTime: "7 min read",
    sections: [
      { heading: "What ATS-friendly actually means", paragraphs: ["An ATS-friendly résumé is not a document packed with keywords. It is a clearly structured file whose headings, dates, job titles, skills, and experience can be read without guessing.", "The same choices usually help human readers too: a simple layout, familiar section names, concise language, and evidence that connects to the target role."] },
      { heading: "Use a dependable section order", steps: ["Name and contact details", "A short professional summary tailored to the target role", "Relevant skills and tools", "Projects, internships, volunteering, or work experience", "Education and relevant certifications"] },
      { heading: "Turn projects into evidence", paragraphs: ["Freshers often have more evidence than they think. Coursework, student clubs, freelance work, competitions, volunteering, and personal projects can show how you solve problems, collaborate, communicate, research, analyse information, or use specific tools.", "Describe the goal, what you personally did, the tools or methods you used, and the observable outcome. Do not present a group result as solely your own contribution."] },
      { heading: "Check the file before applying", steps: ["Use a standard font and avoid text placed inside images.", "Keep important information out of headers, footers, charts, and decorative sidebars.", "Save the file in the format the employer requests, usually DOCX or PDF.", "Copy the text into a plain-text editor to confirm the reading order still makes sense.", "Compare the final résumé with the specific job description and remove unsupported claims."] },
    ],
  },
  {
    slug: "resume-job-description-match-checklist",
    title: "Résumé vs Job Description: A Practical Match Checklist",
    description: "Compare a résumé with a job description using evidence, priorities, and honest gaps instead of an unexplained match score.",
    eyebrow: "Application checklist",
    readTime: "8 min read",
    sections: [
      { heading: "Start with the employer’s priorities", paragraphs: ["Read the job description once for context, then a second time to identify repeated responsibilities, required tools, experience levels, and outcomes. Repetition and placement usually reveal what matters most.", "Separate essential requirements from preferred ones. A long list of nice-to-have skills should not carry the same weight as the role’s core responsibilities."] },
      { heading: "Classify every important requirement", steps: ["Demonstrated: the résumé contains clear, specific evidence.", "Unclear: related experience may exist, but the connection is weak or buried.", "Not demonstrated: the résumé does not currently show relevant evidence.", "Not applicable: the requirement is not important enough to influence this application."] },
      { heading: "Improve unclear evidence first", paragraphs: ["An unclear match is often the easiest opportunity. Reorder a bullet, name the relevant tool, explain the problem you solved, or add context that helps a recruiter understand why the experience matters.", "Only add information you can support. If the experience is not real, keep it as a gap and decide whether the role is still realistic."] },
      { heading: "Run a final application check", steps: ["Does the summary describe the target role and your strongest relevant evidence?", "Are the most important genuine skills easy to find?", "Do the first bullets under each role support the employer’s priorities?", "Can you explain every claim with a real example in an interview?", "Are there critical requirements with no evidence that make another role a better use of your time?"] },
    ],
  },
  {
    slug: "job-application-tracker-guide",
    title: "How to Track Job Applications Without Losing Follow-Ups",
    description: "Use a simple job-application tracker to manage deadlines, contacts, follow-ups, interviews, and lessons from each application.",
    eyebrow: "Job-search organization",
    readTime: "6 min read",
    sections: [
      { heading: "Track decisions, not just application counts", paragraphs: ["A useful tracker is more than a list of companies. It helps you remember why a role was worth applying to, which résumé version you used, who you contacted, and what should happen next.", "The goal is not to maximize the number of rows. It is to make each application easier to manage and improve the quality of your next decision."] },
      { heading: "The fields worth keeping", steps: ["Company, role, location, and job link", "Date found, application deadline, and date applied", "Fit notes and the most important requirements", "Résumé version and supporting documents used", "Recruiter, hiring manager, referral, or other contact", "Current stage, next action, and follow-up date", "Outcome and a short lesson"] },
      { heading: "Create a small follow-up routine", paragraphs: ["Review the tracker at the same time two or three times a week. Close expired roles, prepare upcoming applications, send appropriate follow-ups, and schedule interview preparation before it becomes urgent.", "Use one clear next-action field. A row without a next action is information; a row with a next action becomes part of a working system."] },
      { heading: "Use the tracker to improve your strategy", steps: ["Compare response rates across role types rather than judging yourself by total applications.", "Notice which résumé evidence leads to conversations.", "Identify repeated skill gaps across strong-fit roles.", "Record which outreach messages create genuine replies.", "Stop spending time on channels or roles that repeatedly show poor fit."] },
    ],
  },
  {
    slug: "write-resume-bullets-without-inventing-metrics",
    title: "How to Write Strong Résumé Bullets Without Inventing Metrics",
    description: "Write specific, credible résumé bullets when you do not have revenue figures, percentages, or other impressive-looking numbers.",
    eyebrow: "Résumé writing guide",
    readTime: "7 min read",
    sections: [
      { heading: "Specific does not always mean numerical", paragraphs: ["Numbers are useful when they are accurate and meaningful, but a bullet can be strong without them. Recruiters also need to understand the problem, your contribution, the complexity of the work, the people involved, and what changed.", "Invented percentages weaken credibility. If you cannot explain where a number came from, leave it out."] },
      { heading: "Build the bullet from four parts", steps: ["Context: the team, customer, project, or problem", "Action: what you personally did", "Method: the tool, skill, process, or decision you used", "Outcome: what became clearer, faster, safer, easier, more consistent, or ready for the next step"] },
      { heading: "Use honest forms of scale", paragraphs: ["Scale can be described through scope instead of a fabricated result. You might name the number of stakeholders, documents reviewed, product areas supported, locations covered, deadlines met, workflows documented, or tools integrated—only when those details are true.", "Qualitative outcomes can also be concrete: reduced ambiguity, created a repeatable process, enabled a handoff, improved visibility, supported a launch, or resolved a recurring issue."] },
      { heading: "Audit every bullet before using it", steps: ["Can you explain the situation and your contribution in an interview?", "Does the opening verb describe what you actually did?", "Is the method specific enough to distinguish the work from a generic responsibility?", "Does the outcome follow logically from the action?", "Would a former colleague recognize the bullet as an accurate description?"] },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
