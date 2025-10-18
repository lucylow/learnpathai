# API Keys Cheatsheet — LearnPath AI
Quick reference for all 8 third-party APIs: auth headers, sample curl, pricing, and docs.

---

## 1. OpenAI (LLMs, embeddings, Whisper)

**Why:** Core LLM features (path generation, explanations, quiz generation, embeddings for RAG).

**Auth header:** `Authorization: Bearer <API_KEY>`

**Docs:** https://platform.openai.com/docs/api-reference

**Pricing:** Usage-based; free trial credits available. Check dashboard for quotas.

**Sample curl:**
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role":"user", "content":"Explain photosynthesis"}]
  }'
```

**Supabase Secret name:** `OPENAI_API_KEY`

**Edge Function:** `/supabase/functions/openai-chat/`

---

## 2. AssemblyAI (Speech-to-Text, diarization, summarization)

**Why:** High-quality transcription for lecture/video indexing, speaker diarization, content tagging.

**Auth header:** `Authorization: <YOUR_API_KEY>`

**Docs:** https://www.assemblyai.com/docs

**Pricing:** Free trial credits / pay-as-you-go. Check dashboard for usage.

**Sample curl (submit transcription):**
```bash
curl https://api.assemblyai.com/v2/transcript \
  -H "Authorization: $ASSEMBLYAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://example.com/audio.mp3",
    "speaker_labels": true,
    "summarization": true
  }'
```

**Sample curl (get transcript):**
```bash
curl https://api.assemblyai.com/v2/transcript/<transcript_id> \
  -H "Authorization: $ASSEMBLYAI_API_KEY"
```

**Supabase Secret name:** `ASSEMBLYAI_API_KEY`

**Edge Function:** `/supabase/functions/assemblyai-transcribe/`

---

## 3. ElevenLabs (Text-to-Speech)

**Why:** Natural-sounding TTS for audio guidance, read-aloud, accessibility features.

**Auth header:** `xi-api-key: <YOUR_KEY>`

**Docs:** https://elevenlabs.io/docs/api-reference

**Pricing:** Free tier for prototyping; graded plans for commercial use.

**Sample curl:**
```bash
curl https://api.elevenlabs.io/v1/text-to-speech/<voice-id> \
  -X POST \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, Alex. Here is your next lesson.",
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
  }' \
  --output audio.mp3
```

**Popular voice IDs:**
- Sarah (default): `EXAVITQu4vr4xnSDxMaL`
- Check dashboard for more voices

**Supabase Secret name:** `ELEVENLABS_API_KEY`

**Edge Function:** `/supabase/functions/elevenlabs-tts/`

---

## 4. Deepgram (Real-time & batch Speech-to-Text)

**Why:** Low-latency real-time transcription for live study rooms, voice agents, meeting summarization.

**Auth header:** `Authorization: Token <YOUR_API_KEY>`

**Docs:** https://developers.deepgram.com/docs

**Pricing:** Usage tiering; built for real-time and scalable workloads.

**Sample curl (pre-recorded):**
```bash
curl https://api.deepgram.com/v1/listen \
  -X POST \
  -H "Authorization: Token $DEEPGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/audio.wav",
    "punctuate": true,
    "diarize": true
  }'
```

**Sample curl (streaming):** Use WebSocket: `wss://api.deepgram.com/v1/listen?punctuate=true`

**Supabase Secret name:** `DEEPGRAM_API_KEY`

**Edge Function:** Create `/supabase/functions/deepgram-transcribe/` (similar to AssemblyAI pattern)

---

## 5. Twilio (SMS / Voice / WhatsApp notifications)

**Why:** Send SMS notifications, OTP verification, voice reminders for habit nudges.

**Auth:** Account SID + Auth Token (HTTP Basic Auth: `AccountSid:AuthToken`)

**Docs:** https://www.twilio.com/docs/usage/api

**Pricing:** Per-message and per-phone number pricing; low-cost per SMS.

**Sample curl (send SMS):**
```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  --data-urlencode "Body=Your learning streak is 7 days! 🔥" \
  --data-urlencode "From=+1234567890" \
  --data-urlencode "To=+0987654321" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

**Supabase Secret names:** 
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER` (your Twilio number)

**Edge Function:** Create `/supabase/functions/twilio-sms/`

---

## 6. SendGrid (Transactional Email API)

**Why:** Send onboarding emails, certificate links, teacher notifications, weekly reports.

**Auth header:** `Authorization: Bearer <SENDGRID_API_KEY>`

**Docs:** https://docs.sendgrid.com/api-reference

**Pricing:** Free tier + pay-per-volume.

**Sample curl:**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{
      "to": [{"email": "student@example.com"}],
      "subject": "Your LearnPath Certificate is Ready!"
    }],
    "from": {"email": "noreply@learnpath.ai"},
    "content": [{
      "type": "text/html",
      "value": "<h1>Congrats!</h1><p>Download your certificate: <a href=\"...\">Link</a></p>"
    }]
  }'
```

**Supabase Secret name:** `SENDGRID_API_KEY`

**Edge Function:** Create `/supabase/functions/sendgrid-email/`

---

## 7. Pinata (IPFS pinning for certificates & badges)

**Why:** Pin badges/certificates to IPFS for decentralized, tamper-proof storage (blockchain-ready).

**Auth headers:** 
- `pinata_api_key: <YOUR_API_KEY>`
- `pinata_secret_api_key: <YOUR_SECRET_KEY>`

**Docs:** https://docs.pinata.cloud/

**Pricing:** Free starter plan; paid plans for larger storage.

**Sample curl (pin JSON):**
```bash
curl -X POST https://api.pinata.cloud/pinning/pinJSONToIPFS \
  -H "Content-Type: application/json" \
  -H "pinata_api_key: $PINATA_API_KEY" \
  -H "pinata_secret_api_key: $PINATA_SECRET_KEY" \
  -d '{
    "pinataContent": {
      "name": "Python Mastery Certificate",
      "description": "Awarded to Alex for completing Python path",
      "image": "ipfs://QmXxx..."
    },
    "pinataMetadata": {
      "name": "learnpath-cert-123"
    }
  }'
```

**Supabase Secret names:**
- `PINATA_API_KEY`
- `PINATA_SECRET_KEY`

**Edge Function:** Create `/supabase/functions/pinata-pin/`

---

## 8. web3.storage (IPFS + token-based uploads)

**Why:** Simple programmatic IPFS uploads for metadata & assets (certificates, images).

**Auth header:** `Authorization: Bearer <WEB3_STORAGE_TOKEN>`

**Docs:** https://web3.storage/docs/

**Pricing:** Free tokens for basic use.

**Sample curl (upload file):**
```bash
curl -X POST https://api.web3.storage/upload \
  -H "Authorization: Bearer $WEB3_STORAGE_TOKEN" \
  -F file=@certificate.png
```

**Supabase Secret name:** `WEB3_STORAGE_TOKEN`

**Edge Function:** Create `/supabase/functions/web3-storage-upload/`

---

## Quick Setup Checklist (for ALL APIs)

1. **Create account & generate API key** on provider dashboard  
2. **Add secret to Supabase:**
   - **Dashboard:** Project → Settings → Edge Functions → Secrets → Add new secret  
   - **CLI:** `npx supabase secrets set KEY_NAME=key_value`
3. **Create Edge Function** that reads `Deno.env.get('KEY_NAME')`  
4. **Deploy:** `npx supabase functions deploy <function-name>`  
5. **Test from frontend:** Call `https://<project-ref>.supabase.co/functions/v1/<function-name>`

---

## Security Best Practices

✅ **DO:**
- Store ALL API keys in Supabase Secrets (never in frontend code or Git)
- Call third-party APIs from server-side Edge Functions only
- Set billing alerts on provider dashboards
- Cache/debounce repeated calls (embeddings, TTS) to reduce costs
- Rotate keys if you suspect a leak

❌ **DON'T:**
- Embed API keys in client code or `.env` files committed to Git
- Forward raw API responses with sensitive data to frontend
- Skip rate-limiting or quota checks in Edge Functions

---

## Priority APIs for LearnPath AI (Top 5)

If adding APIs incrementally, start with these:

1. **OpenAI** — LLMs, embeddings (path generation, explanations) ✅ Already implemented
2. **AssemblyAI** — Transcription for video/audio indexing ✅ Already implemented
3. **ElevenLabs** — TTS for accessibility + demo voiceover ✅ Already implemented
4. **SendGrid** — Email notifications for certificates/reports
5. **Pinata** — IPFS hosting for blockchain-ready certificates

---

## Next Steps

- **Deploy Edge Functions:** `npx supabase functions deploy openai-chat`
- **Add Secrets:** Dashboard or `npx supabase secrets set OPENAI_API_KEY=sk-...`
- **Test in frontend:** 
  ```typescript
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/openai-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Explain DKT models' }]
      })
    }
  );
  const data = await response.json();
  console.log(data.choices[0].message.content);
  ```

---

**All Edge Functions ready to deploy! 🚀**

