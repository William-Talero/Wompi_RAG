import { ChatOpenAI } from '@langchain/openai';
import { config } from '../../shared/config/environment';

export interface LLMResponse {
  response: string;
  context: string[];
}

export class OpenAILLMService {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
    });
  }

  async generateResponse(query: string, context: string[]): Promise<LLMResponse> {
    const contextText = context.join('\n\n');
    
    const prompt = `Eres un asistente virtual especializado en Wompi. Responde la siguiente pregunta basándote únicamente en el contexto proporcionado.

Contexto:
${contextText}

Pregunta: ${query}

Respuesta:`;

    const response = await this.llm.invoke(prompt);
    
    return {
      response: response.content as string,
      context
    };
  }
}