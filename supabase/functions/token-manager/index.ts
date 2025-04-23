
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts"
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_SECRET')!
const supabaseUrl = 'https://lxsuqqlfuftnvuvtctsx.supabase.co'
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function encryptToken(text: string): Promise<string> {
  const encodedText = new TextEncoder().encode(text)
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(ENCRYPTION_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  )
  const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength)
  encryptedArray.set(iv)
  encryptedArray.set(new Uint8Array(encryptedData), iv.length)
  return base64Encode(encryptedArray)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { token, refresh_token, service, tenant_id, expires_in } = await req.json()

    if (!token || !service || !tenant_id) {
      throw new Error('Missing required fields')
    }

    const encrypted = await encryptToken(token)
    const encryptedRefresh = refresh_token ? await encryptToken(refresh_token) : null
    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000).toISOString() : null
    
    const { error } = await supabase
      .from('encrypted_tokens')
      .upsert({
        tenant_id,
        service,
        encrypted_token: encrypted,
        refresh_token: encryptedRefresh,
        token_type: refresh_token ? 'both' : 'access',
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
