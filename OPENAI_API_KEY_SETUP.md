# OpenAI API Key Setup

## Current Status

⚠️ **The OpenAI API key in your `.env` file appears to be expired or invalid.**

The system has been updated to use **mock responses** for development when the API key is not working. This allows you to continue testing the application without a valid OpenAI key.

## Getting a New API Key

1. **Visit OpenAI Platform**: https://platform.openai.com/api-keys
2. **Sign in** to your OpenAI account (or create one)
3. **Create a new API key**:
   - Click "Create new secret key"
   - Give it a name (e.g., "Intelligens Development")
   - Copy the key immediately (you won't be able to see it again)
4. **Update your `.env` file**:
   ```bash
   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
   ```
5. **Restart the server** for changes to take effect

## Billing & Credits

- OpenAI API requires billing to be set up
- New accounts may receive free credits
- Check your usage at: https://platform.openai.com/usage
- Set up billing at: https://platform.openai.com/account/billing

## Mock Mode (Current Behavior)

When the API key is invalid or missing, the system automatically uses mock responses:

### Job DNA Generation
- Analyzes the job description for keywords
- Generates realistic DNA traits based on detected technologies
- Returns structured data matching the expected format
- Includes all 5 DNA categories: Skill, Experience, Behavioral, Communication, Cultural

### Interview Analysis
- Would use mock analysis (not yet implemented)

## Testing with Mock Data

The mock responses are intelligent and context-aware:
- Detects technologies mentioned in job descriptions (React, Node.js, Python, Java, etc.)
- Adjusts experience level based on keywords (Senior, Lead, etc.)
- Provides realistic traits, signals, and importance levels

## Switching Back to Real API

Once you have a valid API key:
1. Update `OPENAI_API_KEY` in `server/.env`
2. Restart the server
3. The system will automatically detect the valid key and use real OpenAI API calls

## Cost Considerations

Using the real OpenAI API:
- **Job DNA Generation**: ~$0.01-0.03 per job (using GPT-4 Turbo)
- **Interview Analysis**: ~$0.05-0.10 per interview
- Consider using GPT-3.5-turbo for lower costs (update in `ai.service.ts`)

## Alternative: Use GPT-3.5-Turbo

To reduce costs, you can switch to GPT-3.5-turbo:

In `server/src/services/ai.service.ts`, change:
```typescript
model: 'gpt-4-turbo-preview'
```
to:
```typescript
model: 'gpt-3.5-turbo'
```

This will reduce costs by ~90% but may produce slightly less accurate results.

## Troubleshooting

### "Invalid API key" error
- Key may be expired or revoked
- Check if billing is set up
- Verify the key is copied correctly (no extra spaces)

### "Rate limit exceeded"
- You've hit your usage quota
- Check usage at: https://platform.openai.com/usage
- Upgrade your plan or wait for quota reset

### "Insufficient quota"
- No credits remaining on your account
- Add billing information or purchase credits

## Support

- OpenAI Documentation: https://platform.openai.com/docs
- OpenAI Community: https://community.openai.com
- Billing Support: https://help.openai.com
