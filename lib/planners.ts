export type Planner = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  price: number;
  pages: number;
  cadence: string;
  cover: string;
  includes: string[];
};

export const planners: Planner[] = [
  {
    slug: "daily-job-search-planner",
    title: "Daily Job Search Planner",
    shortTitle: "Daily Job Search",
    eyebrow: "Planner 01",
    description: "A calm daily framework to choose your most valuable job-search actions and follow through.",
    price: 99,
    pages: 10,
    cadence: "Daily planning",
    cover: "/assets/planners/daily-job-search-planner.png",
    includes: ["Daily focus pages", "Application priority prompts", "Follow-up space", "End-of-day reflection"],
  },
  {
    slug: "14-day-job-search-sprint",
    title: "14-Day Job Search Sprint",
    shortTitle: "14-Day Sprint",
    eyebrow: "Planner 02",
    description: "A two-week reset for moving from scattered applications to a focused, repeatable search routine.",
    price: 149,
    pages: 18,
    cadence: "14-day sprint",
    cover: "/assets/planners/14-day-job-search-sprint.png",
    includes: ["14 focused daily plans", "Momentum checkpoints", "Application rhythm", "Weekly review pages"],
  },
  {
    slug: "interview-preparation-planner",
    title: "Interview Preparation Planner",
    shortTitle: "Interview Prep",
    eyebrow: "Planner 03",
    description: "Turn interview nerves into a clear preparation routine, from role research to your final follow-up.",
    price: 149,
    pages: 14,
    cadence: "Per interview",
    cover: "/assets/planners/interview-preparation-planner.png",
    includes: ["Role research guide", "Story and answer practice", "Question bank", "Follow-up checklist"],
  },
  {
    slug: "career-switch-planner",
    title: "Career Switch Planner",
    shortTitle: "Career Switch",
    eyebrow: "Planner 04",
    description: "A practical companion for defining your direction, finding transferable strengths, and planning the transition.",
    price: 199,
    pages: 17,
    cadence: "Career transition",
    cover: "/assets/planners/career-switch-planner.png",
    includes: ["Direction mapping", "Transferable-skills audit", "Role research", "Transition action plan"],
  },
  {
    slug: "first-90-days-planner",
    title: "First 90 Days Planner",
    shortTitle: "First 90 Days",
    eyebrow: "Planner 05",
    description: "Start a new role with a thoughtful plan for learning quickly, building trust, and making progress visible.",
    price: 199,
    pages: 18,
    cadence: "First 90 days",
    cover: "/assets/planners/first-90-days-planner.png",
    includes: ["30 / 60 / 90-day maps", "Relationship tracker", "Learning plan", "Weekly reflection pages"],
  },
];

export function getPlanner(slug: string) {
  return planners.find((planner) => planner.slug === slug);
}
