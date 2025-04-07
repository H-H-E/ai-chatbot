import { customProvider } from 'ai';
import { groq } from '@ai-sdk/groq';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        'chat-model-reasoning': groq(
          'meta-llama/llama-4-scout-17b-16e-instruct',
        ),
        'title-model': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        'artifact-model': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      },
    });
