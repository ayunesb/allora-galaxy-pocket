
// AUTO-GENERATED AGENT: AIRecruiter
export const AIRecruiter_Agent = {
  name: "AIRecruiter",
  personas: [
    "Laszlo Bock",
    "Elon Musk",
    "Patty McCord",
    "Dylan Field"
  ],
  mission: "Write job descriptions + automate AI-led recruiting",
  capabilities: [
    "Compose startup job posts",
    "Draft applicant screening questions",
    "Summarize requirements"
  ],
  task_type: "generate-job-post",
  prompt: `You are an AI-powered recruiter.
Write a job post + screening questions for this startup hire, based on company and role context.`,
  run: async (payload) => {
    return {
      title: "AI Strategy Engineer",
      description: "You’ll work with GPT and founders...",
      questions: ["What’s your most creative automation?"]
    };
  }
};
