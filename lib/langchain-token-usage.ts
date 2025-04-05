import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import type { UIMessage } from 'ai';

const MODEL_NAME_MAPPING: Record<string, { provider: string; name: string }> = {
  'chat-model-gpt-4o': { provider: 'openai', name: 'gpt-4o' },
  'chat-model-gpt-4': { provider: 'openai', name: 'gpt-4' },
  'chat-model-gpt-3.5-turbo': { provider: 'openai', name: 'gpt-3.5-turbo' },
  'claude-sonnet': {
    provider: 'anthropic',
    name: 'claude-3-5-sonnet-20240620',
  },
  // Add other model mappings as needed
};

/**
 * Counts tokens for chat models using Langchain
 */
export async function countTokensWithLangchain(
  messages: UIMessage[],
  modelName: string,
  systemPrompt?: string,
): Promise<{
  inputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
}> {
  const modelInfo = MODEL_NAME_MAPPING[modelName] || {
    provider: 'openai',
    name: modelName,
  };

  // Select the right counter based on provider
  if (modelInfo.provider === 'anthropic') {
    return countTokensWithAnthropicModel(
      messages,
      modelInfo.name,
      systemPrompt,
    );
  } else {
    // Default to OpenAI logic
    return countTokensWithOpenAIModel(messages, modelInfo.name, systemPrompt);
  }
}

/**
 * Count tokens using OpenAI models
 */
async function countTokensWithOpenAIModel(
  messages: UIMessage[],
  modelName: string,
  systemPrompt?: string,
): Promise<{
  inputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
}> {
  // Convert UI messages to Langchain message format
  const langchainMessages = messages.map((message) => {
    const content = convertMessageContent(message.parts);

    if (message.role === 'user') {
      return new HumanMessage(content);
    } else if (message.role === 'assistant') {
      return new AIMessage(content);
    } else {
      return new SystemMessage(content);
    }
  });

  // Add system prompt if provided
  if (systemPrompt) {
    langchainMessages.unshift(new SystemMessage(systemPrompt));
  }

  // Create a ChatOpenAI instance to use its token counting
  const chat = new ChatOpenAI({ modelName });

  // Count tokens
  const tokenCount = await chat.getNumTokensFromMessages(langchainMessages);
  const inputTokens = tokenCount.totalCount;

  // Estimate output tokens (approximately 1/3 of input as a rough estimate)
  const estimatedOutputTokens = Math.ceil(inputTokens / 3);

  // Get total tokens
  const totalTokens = inputTokens + estimatedOutputTokens;

  return {
    inputTokens,
    estimatedOutputTokens,
    totalTokens,
  };
}

/**
 * Count tokens using Anthropic models
 */
async function countTokensWithAnthropicModel(
  messages: UIMessage[],
  modelName: string,
  systemPrompt?: string,
): Promise<{
  inputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
}> {
  // Convert UI messages to Langchain message format
  const langchainMessages = messages.map((message) => {
    const content = convertMessageContent(message.parts);

    if (message.role === 'user') {
      return new HumanMessage(content);
    } else if (message.role === 'assistant') {
      return new AIMessage(content);
    } else {
      return new SystemMessage(content);
    }
  });

  // Add system prompt if provided
  if (systemPrompt) {
    langchainMessages.unshift(new SystemMessage(systemPrompt));
  }

  // Create a ChatAnthropic instance to use its token counting
  const chat = new ChatAnthropic({ modelName });

  // Count tokens
  const tokenCount = await chat.getNumTokensFromMessages(langchainMessages);
  const inputTokens = tokenCount.totalCount;

  // Anthropic models typically have different output/input ratios
  // Using a more conservative estimate for Anthropic (1/2 instead of 1/3)
  const estimatedOutputTokens = Math.ceil(inputTokens / 2);

  // Get total tokens
  const totalTokens = inputTokens + estimatedOutputTokens;

  return {
    inputTokens,
    estimatedOutputTokens,
    totalTokens,
  };
}

/**
 * Helper function to convert message parts to string content
 */
function convertMessageContent(parts: any): string {
  if (Array.isArray(parts)) {
    return parts
      .map((part) => (typeof part === 'string' ? part : JSON.stringify(part)))
      .join('\n');
  } else if (typeof parts === 'string') {
    return parts;
  } else {
    return JSON.stringify(parts);
  }
}

/**
 * Get the maximum context size for a given model
 */
export function getModelMaxTokens(modelName: string): number {
  const modelInfo = MODEL_NAME_MAPPING[modelName] || {
    provider: 'openai',
    name: modelName,
  };

  // Use approximate context sizes for different model providers
  const contextSizes: Record<string, number> = {
    // OpenAI models
    'gpt-4o': 128000,
    'gpt-4': 8192,
    'gpt-3.5-turbo': 4096,
    // Anthropic models
    'claude-3-5-sonnet-20240620': 200000,
    'claude-3-opus-20240229': 200000,
    'claude-3-sonnet-20240229': 200000,
    'claude-3-haiku-20240307': 200000,
    // Add other models as needed
  };

  return contextSizes[modelInfo.name] || 4096; // Default to 4096 if unknown
}

/**
 * Count tokens in a single text string
 */
export async function countTokensInText(
  text: string,
  modelName: string,
): Promise<number> {
  const modelInfo = MODEL_NAME_MAPPING[modelName] || {
    provider: 'openai',
    name: modelName,
  };

  if (modelInfo.provider === 'anthropic') {
    const chat = new ChatAnthropic({ modelName: modelInfo.name });
    const message = new HumanMessage(text);
    const tokenCount = await chat.getNumTokensFromMessages([message]);
    return tokenCount.totalCount;
  } else {
    const chat = new ChatOpenAI({ modelName: modelInfo.name });
    const message = new HumanMessage(text);
    const tokenCount = await chat.getNumTokensFromMessages([message]);
    return tokenCount.totalCount;
  }
}
