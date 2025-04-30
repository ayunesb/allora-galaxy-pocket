export async function callAdminFunction(path: string, payload = {}) {
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return await res.json();
}
