# Token Usage Tracking & Rate Limiting

This document outlines how token usage tracking and rate limiting are implemented in the AI chatbot.

## Token Usage Tracking

### Overview

The AI chatbot tracks token usage for each conversation to:
1. Enforce usage limits per user
2. Provide analytics on token consumption
3. Allow for potential billing based on usage

### Implementation

Token usage is tracked in two ways:

#### 1. Vercel AI SDK Metadata (Post-completion)

The Vercel AI SDK returns usage metadata after a completion is finished, including:
- `prompt_tokens` (input)
- `completion_tokens` (output)
- `total_tokens` (combined)

This data is recorded in the `TokenUsage` table via the `recordTokenUsage` function.

#### 2. Langchain Token Counting (Pre-estimation)

For more granular control and pre-estimation, Langchain's token counting utilities are used:

- **Pre-call estimation**: Before making the API call, `countTokensWithLangchain` estimates the tokens
- **Input tokens**: Recorded immediately before the API call
- **Output tokens**: Either from the AI SDK response or estimated if not available

### Multi-Model Support

The token counting implementation supports multiple LLM providers:

- **OpenAI**: Uses `ChatOpenAI` from `@langchain/openai` for token counting
- **Anthropic**: Uses `ChatAnthropic` from `@langchain/anthropic` for Claude models
- Other providers can be added by extending the `MODEL_NAME_MAPPING` object

Each model provider has its own token counting implementation with appropriate handling for different message formats and estimation ratios.

## Rate Limiting

### Overview

Rate limiting prevents abuse and ensures fair resource allocation across users by:
1. Limiting requests per IP address
2. Limiting requests per user
3. Enforcing daily token usage limits

### Implementation

#### 1. In-Memory Rate Limiting

The chatbot includes a simple in-memory rate limiter that tracks:
- Requests per IP address within a time window
- Requests per user ID within a time window

This implementation is suitable for development and single-server deployments.

#### 2. Token-Based Rate Limiting

Daily token usage is tracked in the database and enforced via the `hasExceededDailyLimit` function.

#### 3. Redis-Based Rate Limiting (Production)

For production environments, a Redis-based implementation is available that:
- Provides distributed rate limiting across multiple servers
- Persists rate limiting data even if a server restarts
- Scales to handle high-traffic applications

## Key Files

- `lib/token-usage.ts`: Core token tracking implementation
- `lib/langchain-token-usage.ts`: Langchain-based token counting for multiple models
- `lib/rate-limit.ts`: In-memory rate limiting implementation
- `lib/redis-rate-limit.ts`: Redis-based rate limiting for production
- `lib/db/schema.ts`: TokenUsage and UserLimits database schemas
- `app/(chat)/api/chat/route.ts`: Integration into the chat API

## Usage Examples

```typescript
// Example: Estimate tokens before an API call
const tokenEstimate = await countTokensWithLangchain(
  messages,
  selectedChatModel,
  systemPrompt
);

// Example: Record token usage
await recordTokenUsage({
  userId: user.id,
  chatId: chatId,
  modelId: modelName,
  inputTokens: 500,
  outputTokens: 200,
  totalTokens: 700
});

// Example: Check if user has exceeded their daily limit
const hasExceeded = await hasExceededDailyLimit(userId);

// Example: Check rate limiting by IP
const isLimited = await limitByIp(request, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30 // 30 requests per minute
});
```

## Benefits

- More granular control over token usage
- Pre-call estimation for limit checking
- Consistent counting across all models
- Multiple layers of rate limiting protection
- Works even with models that don't report usage metadata 