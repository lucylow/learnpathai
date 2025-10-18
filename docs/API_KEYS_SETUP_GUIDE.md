# API Keys Setup Guide — Step-by-Step
Complete walkthrough for adding API keys to LearnPath AI with Supabase Edge Functions

---

## Overview

This guide shows you how to:
1. Generate API keys from provider dashboards
2. Store keys securely in Supabase Secrets
3. Deploy Edge Functions that use those keys
4. Test the integration from your frontend

**Time to complete:** 15-20 minutes per API

---

## Prerequisites

- Supabase project created ([dashboard](https://supabase.com/dashboard))
- Supabase CLI installed: `npm install -g supabase`
- Logged in to CLI: `npx supabase login`

---

## Part 1: Generate API Keys

### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click **"Create new secret key"**
4. Copy key (starts with `sk-`) — **save immediately, you can't view it again**
5. Add billing method (for production) or use free trial credits

**Key format:** `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### AssemblyAI

1. Go to [assemblyai.com](https://www.assemblyai.com/)
2. Sign up / log in
3. Dashboard → API Keys section
4. Copy your API key (starts with alphanumeric string)
5. Free trial credits included for testing

**Key format:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### ElevenLabs

1. Go to [elevenlabs.io](https://elevenlabs.io/)
2. Sign up / log in
3. Profile icon → Profile Settings → API Keys
4. Click **"Generate new key"**
5. Copy key
6. Free tier available for prototyping

**Key format:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Twilio (optional — SMS/Voice)

1. Go to [twilio.com/console](https://www.twilio.com/console)
2. Sign up / log in
3. Get **Account SID** and **Auth Token** from dashboard home
4. Get a phone number: Console → Phone Numbers → Buy a Number
5. Free trial credits included

**Keys needed:**
- `TWILIO_ACCOUNT_SID` (starts with `AC`)
- `TWILIO_AUTH_TOKEN` (32-char string)
- `TWILIO_PHONE_NUMBER` (E.164 format: `+1234567890`)

---

### SendGrid (optional — Email)

1. Go to [sendgrid.com](https://sendgrid.com/)
2. Sign up / log in
3. Settings → API Keys → Create API Key
4. Choose "Full Access" or "Restricted Access" (Mail Send only)
5. Copy key (starts with `SG.`)
6. Free tier: 100 emails/day

**Key format:** `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Pinata (optional — IPFS)

1. Go to [pinata.cloud](https://www.pinata.cloud/)
2. Sign up / log in
3. Developers → API Keys → New Key
4. Select permissions (pinning, unpinning, etc.)
5. Copy **API Key** and **API Secret**
6. Free plan: 1 GB storage

**Keys needed:**
- `PINATA_API_KEY`
- `PINATA_SECRET_KEY`

---

### web3.storage (optional — IPFS)

1. Go to [web3.storage](https://web3.storage/)
2. Sign up / log in
3. Account → Create API Token
4. Copy token
5. Free tier included

**Key format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Part 2: Add API Keys to Supabase Secrets

### Option A: Supabase Dashboard (Recommended for Beginners)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** (gear icon bottom left)
4. Click **Edge Functions** in left sidebar
5. Scroll to **Secrets** section
6. Click **"Add new secret"**
7. Enter name (e.g., `OPENAI_API_KEY`) and value (your API key)
8. Click **"Add secret"**
9. Repeat for each API key

**Example secrets to add:**
```
OPENAI_API_KEY=sk-proj-...
ASSEMBLYAI_API_KEY=...
ELEVENLABS_API_KEY=...
SENDGRID_API_KEY=SG....
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
WEB3_STORAGE_TOKEN=eyJhbG...
```

---

### Option B: Supabase CLI (Recommended for Teams/CI)

1. Open terminal in your project directory
2. Link to your Supabase project (first time only):
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
   (Find project ref in dashboard URL or Settings → General)

3. Set secrets one by one:
   ```bash
   npx supabase secrets set OPENAI_API_KEY=sk-proj-...
   npx supabase secrets set ASSEMBLYAI_API_KEY=...
   npx supabase secrets set ELEVENLABS_API_KEY=...
   ```

4. Verify secrets are set:
   ```bash
   npx supabase secrets list
   ```

**Tip:** Create a `.env.secrets` file (add to `.gitignore`!) and set all at once:
```bash
# .env.secrets (NEVER commit this file!)
OPENAI_API_KEY=sk-proj-...
ASSEMBLYAI_API_KEY=...
ELEVENLABS_API_KEY=...
```

Then run:
```bash
npx supabase secrets set --env-file .env.secrets
```

---

## Part 3: Deploy Edge Functions

The Edge Functions are already created in `/supabase/functions/`. Now deploy them:

### Deploy all functions:
```bash
cd /Users/llow/Desktop/learnpathai
npx supabase functions deploy openai-chat
npx supabase functions deploy assemblyai-transcribe
npx supabase functions deploy elevenlabs-tts
```

### Or deploy all at once:
```bash
npx supabase functions deploy
```

**Expected output:**
```
Deploying function openai-chat...
Function openai-chat deployed successfully.
Function URL: https://<your-project-ref>.supabase.co/functions/v1/openai-chat
```

---

## Part 4: Test Edge Functions

### Test from terminal (curl)

**OpenAI Chat:**
```bash
curl -X POST \
  https://<your-project-ref>.supabase.co/functions/v1/openai-chat \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful tutor."},
      {"role": "user", "content": "Explain photosynthesis simply."}
    ],
    "model": "gpt-4o-mini"
  }'
```

**AssemblyAI Transcribe:**
```bash
curl -X POST \
  https://<your-project-ref>.supabase.co/functions/v1/assemblyai-transcribe \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://example.com/audio.mp3",
    "speaker_labels": true
  }'
```

**ElevenLabs TTS:**
```bash
curl -X POST \
  https://<your-project-ref>.supabase.co/functions/v1/elevenlabs-tts \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello Alex, welcome to LearnPath AI."
  }'
```

---

### Test from frontend (React/TypeScript)

Create a helper file `/src/lib/apiCalls.ts`:

```typescript
import { supabase } from './supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function callOpenAI(messages: Array<{role: string, content: string}>) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/openai-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ messages, model: 'gpt-4o-mini' })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'OpenAI API call failed');
  }
  
  return await response.json();
}

export async function transcribeAudio(audioUrl: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/assemblyai-transcribe`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        audio_url: audioUrl,
        speaker_labels: true,
        summarization: true
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Transcription failed');
  }
  
  return await response.json();
}

export async function generateSpeech(text: string, voiceId?: string) {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ text, voice_id: voiceId })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'TTS generation failed');
  }
  
  const data = await response.json();
  return `data:audio/mpeg;base64,${data.audio_base64}`;
}
```

**Usage in a component:**
```typescript
import { callOpenAI, transcribeAudio, generateSpeech } from '@/lib/apiCalls';

// In your component:
const handleAskAI = async () => {
  try {
    const result = await callOpenAI([
      { role: 'user', content: 'Explain DKT models' }
    ]);
    console.log(result.choices[0].message.content);
  } catch (error) {
    console.error('AI call failed:', error);
  }
};

const handleTranscribe = async () => {
  try {
    const result = await transcribeAudio('https://example.com/lecture.mp3');
    console.log('Transcript:', result.text);
  } catch (error) {
    console.error('Transcription failed:', error);
  }
};

const handleSpeak = async () => {
  try {
    const audioDataUrl = await generateSpeech('Hello student!');
    const audio = new Audio(audioDataUrl);
    await audio.play();
  } catch (error) {
    console.error('TTS failed:', error);
  }
};
```

---

## Part 5: Verify & Debug

### Check secrets are loaded:
Add a test endpoint to see if secrets are available (for debugging only — remove in production):

```typescript
// supabase/functions/check-secrets/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  const secrets = {
    openai: !!Deno.env.get("OPENAI_API_KEY"),
    assemblyai: !!Deno.env.get("ASSEMBLYAI_API_KEY"),
    elevenlabs: !!Deno.env.get("ELEVENLABS_API_KEY"),
  };
  
  return new Response(JSON.stringify(secrets), {
    headers: { "Content-Type": "application/json" }
  });
});
```

Deploy and test:
```bash
npx supabase functions deploy check-secrets
curl https://<project-ref>.supabase.co/functions/v1/check-secrets
```

Expected: `{"openai":true,"assemblyai":true,"elevenlabs":true}`

**Delete this function after testing!**

---

### Check Edge Function logs:
```bash
npx supabase functions logs openai-chat
```

Or view in dashboard: **Edge Functions → [function name] → Logs**

---

### Common issues:

**Error: "OPENAI_API_KEY not configured"**
- Secret not set in Supabase. Double-check Dashboard → Edge Functions → Secrets.

**Error: 401 Unauthorized from OpenAI**
- Invalid API key or billing not set up. Verify key on platform.openai.com.

**Error: CORS issues in browser**
- Check `_shared/cors.ts` is deployed and imported in all functions.

**Error: Function not found**
- Redeploy: `npx supabase functions deploy <function-name>`

---

## Part 6: Production Checklist

Before going live:

- [ ] All API keys stored in Supabase Secrets (not in `.env` or client code)
- [ ] Billing set up on provider dashboards (OpenAI, AssemblyAI, etc.)
- [ ] Spending alerts configured to avoid surprise bills
- [ ] Rate limiting added to Edge Functions (e.g., max 100 calls/user/day)
- [ ] Error handling and user-friendly messages in frontend
- [ ] Test all functions with real data
- [ ] Remove debug endpoints like `check-secrets`
- [ ] Add monitoring/logging for production errors
- [ ] Document API usage for your team

---

## Summary

✅ **You now have:**
- 3 production-ready Edge Functions (OpenAI, AssemblyAI, ElevenLabs)
- Secure API key storage in Supabase Secrets
- Frontend helper functions to call these APIs
- Testing patterns for development and production

✅ **Next steps:**
- Add more Edge Functions for Twilio, SendGrid, Pinata as needed
- Integrate these APIs into your LearnPath AI features
- Monitor usage and costs on provider dashboards

---

**All set! 🚀 Your API infrastructure is ready for LearnPath AI.**

Need help with a specific API? Check `API_KEYS_CHEATSHEET.md` for curl examples and docs links.

