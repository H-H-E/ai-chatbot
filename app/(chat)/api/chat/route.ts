import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { hasExceededDailyLimit, recordTokenUsage } from '@/lib/token-usage';
import { countTokensWithLangchain } from '@/lib/langchain-token-usage';
import { limitByIp, limitByUser } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Apply IP-based rate limiting
    const isIpLimited = await limitByIp(request, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // 30 requests per minute
    });

    if (isIpLimited) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Apply user-based rate limiting
    const isUserLimited = await limitByUser(session.user.id, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20, // 20 requests per minute
    });

    if (isUserLimited) {
      return new Response(
        JSON.stringify({
          error: 'User rate limit exceeded. Please try again after a minute.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Check if user has exceeded their daily token limit
    const hasExceeded = await hasExceededDailyLimit(session.user.id);
    if (hasExceeded) {
      return new Response(
        JSON.stringify({
          error: 'Daily token limit exceeded. Please try again tomorrow.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    // Calculate input tokens using Langchain before making the API call
    const systemPromptText = systemPrompt({ selectedChatModel });
    const tokenEstimate = await countTokensWithLangchain(
      messages,
      selectedChatModel,
      systemPromptText,
    );

    // Pre-record input tokens immediately
    await recordTokenUsage({
      userId: session.user.id,
      chatId: id,
      modelId: selectedChatModel,
      inputTokens: tokenEstimate.inputTokens,
      outputTokens: 0, // Will be updated after completion
      totalTokens: tokenEstimate.inputTokens,
    });

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPromptText,
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          // Include token usage in streaming mode
          stream_options: {
            include_usage: true,
          },
          onFinish: async (event) => {
            if (session.user?.id) {
              try {
                // Use type assertion to work with Vercel AI SDK types
                const response = event.response as any;

                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message: any) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });

                // Record actual token usage after successful message
                // If AI SDK provides usage data, use that for output tokens
                if (response.usage) {
                  // Update with actual output tokens
                  await recordTokenUsage({
                    userId: session.user.id,
                    chatId: id,
                    modelId: selectedChatModel,
                    inputTokens: 0, // Already recorded earlier
                    outputTokens:
                      response.usage.completion_tokens ||
                      tokenEstimate.estimatedOutputTokens,
                    totalTokens:
                      response.usage.completion_tokens ||
                      tokenEstimate.estimatedOutputTokens,
                  });
                } else {
                  // Use our estimated output tokens if no usage data is provided
                  await recordTokenUsage({
                    userId: session.user.id,
                    chatId: id,
                    modelId: selectedChatModel,
                    inputTokens: 0, // Already recorded earlier
                    outputTokens: tokenEstimate.estimatedOutputTokens,
                    totalTokens: tokenEstimate.estimatedOutputTokens,
                  });
                }
              } catch (error) {
                console.error(
                  'Failed to save chat or record token usage:',
                  error,
                );
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occured!';
      },
    });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
