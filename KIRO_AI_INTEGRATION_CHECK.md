# Kiro: AI Integration Check & Completion

## Your Task
Check and verify all AI service integrations in Ek Bharath Ek Mandi. Complete any missing implementations so the app works with real API keys.

## Services to Check

### 1. Speech-to-Text (Voice Recording → Text)
- **Option A:** Google Cloud Speech-to-Text  
- **Option B:** AWS Transcribe
- **Check:** Is there a service in `/src/services/` that handles voice recording and transcription?
- **Required:** Support for Hindi, Tamil, Telugu, Kannada, Bengali, Oriya, Malayalam

### 2. Text Translation
- **Option A:** Google Cloud Translate
- **Option B:** AWS Translate  
- **Option C:** Gemini (can translate)
- **Check:** Is translation implemented in the chat flow?
- **Required:** Translate between all 8 Indian languages + English

### 3. Text-to-Speech (Text → Voice)
- **Option A:** Google Cloud Text-to-Speech
- **Option B:** AWS Polly
- **Check:** Can users play translated messages as audio?

### 4. LLM (Optional - for smart features)
- **Option A:** Gemini API
- **Option B:** AWS Bedrock
- **Use cases:** Product categorization, price suggestions, smart replies

## Files to Check
```
/src/services/transcribe.ts (or speech.ts)
/src/services/translate.ts
/src/services/polly.ts (or tts.ts)
/src/services/llm.ts (or gemini.ts or bedrock.ts)
/src/app/api/voice/* 
/src/app/api/translate/*
```

## What to Do
1. **If implemented:** Make sure it uses environment variables from `.env.local`
2. **If mock/placeholder:** Replace with real API calls
3. **Create `.env.example`** listing required keys:
   ```
   GOOGLE_CLOUD_API_KEY=
   # OR
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=ap-south-1
   # AND
   GEMINI_API_KEY=
   ```

## Integration Points
- `/src/app/chat/[id]/page.tsx` - Voice message recording and playback
- `/src/components/ui/VoiceMessage.tsx` - Voice UI components  
- Seller/Buyer dashboards - Message display with translation

## Priority
1. **CRITICAL:** Speech-to-Text for voice messages
2. **CRITICAL:** Translation for message display
3. **HIGH:** Text-to-Speech for audio playback
4. **MEDIUM:** LLM for smart features

## Test After
Run `npm run dev` and verify:
- [ ] Can record voice and see transcription
- [ ] Transcription translates to other language
- [ ] Can play translated audio

Report back what's working and what needs API keys!
