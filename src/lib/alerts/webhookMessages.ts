
export const createStrategyApprovedMessage = (strategyId: string, userId: string) => 
  `✅ Strategy #${strategyId} has been approved and launched by ${userId}`;

export const createCampaignLaunchedMessage = (campaignName: string, userId: string) =>
  `🚀 Campaign "${campaignName}" has been launched by ${userId}`;

export const createWeeklySummaryMessage = (stats: { strategies: number, campaigns: number }) =>
  `📊 Weekly Summary:\n• ${stats.strategies} strategies created\n• ${stats.campaigns} campaigns launched`;

export const createSystemErrorMessage = (error: { type: string, message: string }) =>
  `⚠️ System Error (${error.type}): ${error.message}`;
