
export async function sendSlackAlert(functionName: string, errorMessage: string) {
  const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!slackWebhookUrl) {
    console.log('No Slack webhook URL configured, skipping alert');
    return;
  }

  const message = `🚨 CRON job failed: *${functionName}*\nError: \`${errorMessage}\`\nTime: ${new Date().toISOString()}`;

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
    
    if (!response.ok) {
      console.error(`Failed to send Slack alert: ${response.status} ${response.statusText}`);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return false;
  }
}
