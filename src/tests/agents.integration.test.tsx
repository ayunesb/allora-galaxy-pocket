
import { describe, it, expect } from "vitest";
import { CMO_Agent } from "../lib/agents/CMO_Agent";
import { CTO_Agent } from "../lib/agents/CTO_Agent";
import { CFO_Agent } from "../lib/agents/CFO_Agent";
import { EmailCoach_Agent } from "../lib/agents/EmailCoach_Agent";
import { RetentionGuru_Agent } from "../lib/agents/RetentionGuru_Agent";
import { CrisisCommander_Agent } from "../lib/agents/CrisisCommander_Agent";
import { DailyUpdateAgent } from "../lib/agents/DailyUpdateAgent";
import { vi } from "vitest";

// Mock fetch to avoid actual API calls during tests
global.fetch = vi.fn();

// Helper to setup fetch mock
function mockFetchResponse(data: any) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  });
}

describe('Agent Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('CMO_Agent generates campaign strategies', async () => {
    const mockResponse = {
      channel: "social",
      message: "Viral campaign for product launch",
      offer: "Limited time discount"
    };
    
    // @ts-ignore - mocking fetch
    global.fetch.mockReturnValue(mockFetchResponse(mockResponse));
    
    const result = await CMO_Agent.run({ 
      product: "AI Marketing Tool", 
      audience: "Small Business Owners" 
    });
    
    expect(result.channel).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.offer).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "/functions/v1/generate-campaign",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );
  });

  it('CTO_Agent generates technical architecture plans', async () => {
    const mockResponse = {
      stack: ["React", "Node.js", "PostgreSQL"],
      integrationMap: {},
      timeline: "12-week implementation"
    };
    
    // @ts-ignore - mocking fetch
    global.fetch.mockReturnValue(mockFetchResponse(mockResponse));
    
    const result = await CTO_Agent.run({ 
      productPlan: "AI-powered analytics dashboard with real-time data processing" 
    });
    
    expect(result.stack).toBeInstanceOf(Array);
    expect(result.timeline).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "/functions/v1/generate-tech-plan",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );
  });

  it('CFO_Agent generates financial forecasts', async () => {
    const mockResponse = {
      forecast: [
        { quarter: "Q1", roi: 0.8 },
        { quarter: "Q2", roi: 1.2 }
      ],
      CAC: 200,
      LTV: 1000
    };
    
    // @ts-ignore - mocking fetch
    global.fetch.mockReturnValue(mockFetchResponse(mockResponse));
    
    const result = await CFO_Agent.run({ 
      strategies: "Launch digital marketing campaign", 
      costs: 5000 
    });
    
    expect(result.forecast).toBeInstanceOf(Array);
    expect(result.CAC).toBeDefined();
    expect(result.LTV).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "/functions/v1/generate-financials",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );
  });

  it('EmailCoach_Agent optimizes email content', async () => {
    const mockResponse = {
      subject: "Don't Miss Out: Special Offer Inside",
      improvedBody: "Optimized email content here",
      reasoning: "Increased urgency and clarity"
    };
    
    // @ts-ignore - mocking fetch
    global.fetch.mockReturnValue(mockFetchResponse(mockResponse));
    
    const result = await EmailCoach_Agent.run({ 
      emailSubject: "Special offer", 
      emailBody: "We have a special offer for you..." 
    });
    
    expect(result.subject).toBeDefined();
    expect(result.improvedBody).toBeDefined();
    expect(result.reasoning).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "/functions/v1/generate-email-optimization",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );
  });

  it('RetentionGuru_Agent creates retention strategies', async () => {
    const mockResponse = {
      triggers: ["churn risk", "no activity"],
      touchpoints: ["email", "popup", "offer"],
      timeline: "7-day winback",
      fullPlan: "Detailed retention plan..."
    };
    
    // @ts-ignore - mocking fetch
    global.fetch.mockReturnValue(mockFetchResponse(mockResponse));
    
    const result = await RetentionGuru_Agent.run({ 
      appDescription: "SaaS project management tool", 
      churnCohort: "Users inactive for 14+ days" 
    });
    
    expect(result.triggers).toBeInstanceOf(Array);
    expect(result.touchpoints).toBeInstanceOf(Array);
    expect(result.timeline).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "/functions/v1/generate-retention-plan",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );
  });

  it('CrisisCommander_Agent creates recovery plans', async () => {
    const mockResponse = {
      actions: ["Identify impact", "Assemble response team", "Implement fixes"],
      timeline: "72-hour recovery plan",
      messaging: "Transparent communication about the issue and resolution plan",
      fullPlan: "Detailed recovery plan..."
    };
    
    // @ts-ignore - mocking fetch
    global.fetch.mockReturnValue(mockFetchResponse(mockResponse));
    
    const result = await CrisisCommander_Agent.run({ 
      alert: "Conversion rate dropped 50%", 
      metrics: { conversion: 1.2, retention: 65 } 
    });
    
    expect(result.actions).toBeInstanceOf(Array);
    expect(result.timeline).toBeDefined();
    expect(result.messaging).toBeDefined();
    expect(global.fetch).toHaveBeenCalledWith(
      "/functions/v1/generate-recovery-plan",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );
  });

  it('DailyUpdateAgent creates daily digests', async () => {
    const mockResponse = {
      summary: "Daily activity summary...",
      alerts: 3,
      strategies: 2
    };
    
    // @ts-ignore - mocking fetch
    global.fetch.mockReturnValue(mockFetchResponse(mockResponse));
    
    const result = await DailyUpdateAgent.run({ 
      logs: "User activity logs...", 
      metrics: { active_users: 120, revenue: 5000 },
      alerts: ["Conversion drop", "New sign-ups spike"] 
    });
    
    expect(result.summary).toBeDefined();
    expect(typeof result.alerts).toBe("number");
    expect(typeof result.strategies).toBe("number");
    expect(global.fetch).toHaveBeenCalledWith(
      "/functions/v1/generate-daily-digest",
      expect.objectContaining({
        method: "POST",
        body: expect.any(String)
      })
    );
  });

  // Test error handling in agents
  it('Agents handle API errors gracefully', async () => {
    // @ts-ignore - mocking fetch
    global.fetch.mockImplementation(() => Promise.resolve({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal server error")
    }));
    
    const result = await CMO_Agent.run({ 
      product: "Error test", 
      audience: "Error test" 
    });
    
    expect(result.message).toContain("Error");
  });
});
