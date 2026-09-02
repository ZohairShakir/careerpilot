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
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
