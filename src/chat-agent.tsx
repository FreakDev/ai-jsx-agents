import * as AI from 'ai-jsx';
import { AssistantMessage, ChatCompletion, SystemMessage, UserMessage } from 'ai-jsx/core/completion';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MemoryManager {
  saveHistory: (conversationId: string, messages: Message[]) => Promise<void>
  fetchHistory: (conversationId: string) => Promise<Message[]>
}

export interface ChatAgentProps {
  children: AI.Node;
  memoryManager: MemoryManager;
  conversationId: string;
}

export const ChatAgent = async ({ memoryManager, children: message, conversationId }: ChatAgentProps, {render}: AI.RenderContext) => {
  const messages = await memoryManager.fetchHistory(conversationId)

  const newMessage = await render(<ChatCompletion>
    {messages.map(msg => {
      switch(msg.role) {
        case 'user':
          return <UserMessage>
            {msg.content}
          </UserMessage>
        case 'assistant':
          return <AssistantMessage>
            {msg.content}
          </AssistantMessage>
        case 'system':
          return <SystemMessage>
            {msg.content}
          </SystemMessage>
      }
    })}
    <UserMessage>
      {message}
    </UserMessage>
  </ChatCompletion>)

  memoryManager.saveHistory(conversationId, [
    ...messages,
    {
      role: 'user',
      content: await render(message)
    },
    {
      role: 'assistant',
      content: newMessage,
    }
  ])

  return newMessage;
}
  

export default ChatAgent