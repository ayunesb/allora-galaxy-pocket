export function generateStrategy(companyData: any) {
  return {
    title: "Launch Growth Strategy",
    summary: "This AI-generated plan will help scale your startup using targeted campaigns, product optimization, and KPI tracking.",
    goals: ["Increase MRR", "Improve LTV", "Acquire 100 new leads"],
    generatedAt: new Date().toISOString(),
    companyData,
  };
}
