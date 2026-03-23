import { getOpenRouterClient } from '../lib/openrouter.js';
import { semanticSearch } from './memory.service.js';

/**
 * @module chat.service
 * Orchestrates streaming chat responses using the user's stored memories as context.
 * Retrieves relevant memories via semantic search, builds a system prompt,
 * and streams the LLM response token-by-token via callbacks.
 */

/**
 * Streams a chat response grounded in the user's stored memories.
 * Performs semantic search, constructs a system prompt, and streams
 * the LLM output via the provided callbacks.
 *
 * @param message - The user's chat message
 * @param userId - The authenticated user's ID
 * @param onToken - Called for each streamed token with its content string
 * @param onDone - Called once when the stream completes successfully
 * @param onError - Called with an error message string if the stream fails
 */
export async function streamChatResponse(
  message: string,
  userId: string,
  onToken: (content: string) => void,
  onDone: () => void,
  onError: (message: string) => void,
): Promise<void> {
  try {
    const memories = await semanticSearch(message, userId, 10);

    const memoryContext =
      memories.length > 0
        ? memories.map((m, i) => `[${i + 1}] ${m.text}`).join('\n')
        : 'No relevant memories found.';

    const systemPrompt = `You are Neura, a personal AI assistant. Answer the user's question based on their saved memories below.\n\nMemories:\n${memoryContext}\n\nIf the memories don't contain relevant information, say so honestly.`;

    const openrouter = getOpenRouterClient();
    const stream = await openrouter.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) onToken(content);
    }

    onDone();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'An error occurred.';
    onError(msg);
  }
}
