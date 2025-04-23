
export function generateAgentFile({
  agentName,
  mission,
  personas,
  capabilities,
  taskType,
  outputSchema,
  prompt
}: {
  agentName: string,
  mission: string,
  personas: string[],
  capabilities: string[],
  taskType: string,
  outputSchema: string,
  prompt: string
}) {
  return `// AUTO-GENERATED AGENT: ${agentName}
export const ${agentName}_Agent = {
  name: "${agentName}",
  mission: "${mission}",
  personas: ${JSON.stringify(personas)},
  capabilities: ${JSON.stringify(capabilities)},
  task_type: "${taskType}",
  prompt: \`${prompt}\`,
  run: async (payload) => {
    return ${outputSchema}
  }
}
`;
}
