export function buildHireAuthMessage(params: {
  agentId: string;
  agentName: string;
  budgetHuman: string;
  walletAddress: string;
}): string {
  return [
    "Backstop hire authorization",
    `Agent: ${params.agentName} (${params.agentId})`,
    `Budget: ${params.budgetHuman} U`,
    `Wallet: ${params.walletAddress}`,
    `Time: ${new Date().toISOString()}`,
  ].join("\n");
}
