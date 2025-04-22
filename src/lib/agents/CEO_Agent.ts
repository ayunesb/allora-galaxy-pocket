import { logAgentCollaboration, getAgentCollaboration } from './agentCollaboration';
import { logAgentMemory, getAgentMemory } from './memoryLogger';
import type { Strategy } from "@/types/strategy";

export class CEOAgent {
  private sessionId: string;
  private tenantId: string;

  constructor(tenantId: string) {
    this.sessionId = crypto.randomUUID();
    this.tenantId = tenantId;
  }

  async processStrategy(strategy: Strategy) {
    // Load past context from memory
    const memories = await getAgentMemory({
      tenantId: this.tenantId,
      agentName: 'CEO',
      limit: 10
    });

    // Log this interaction
    await logAgentCollaboration({
      sessionId: this.sessionId,
      agent: 'CEO',
      message: `Reviewing strategy: ${strategy.title}`,
      tenantId: this.tenantId
    });

    // Process strategy with context from past memories
    const result = await this.analyzeStrategy(strategy, memories);

    // Store the outcome in agent memory
    await logAgentMemory({
      tenantId: this.tenantId,
      agentName: 'CEO',
      context: `Analyzed strategy: ${strategy.title} with result: ${result}`,
      type: 'history'
    });

    return result;
  }

  private async analyzeStrategy(strategy: Strategy, pastMemories: string[]) {
    const context = pastMemories.join('\n');
    // Basic analysis logic (can be expanded)
    return `Strategy "${strategy.title}" analyzed with context: ${context}. Goal: ${strategy.goal}`;
  }
}
