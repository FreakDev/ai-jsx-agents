import * as AI from 'ai-jsx';
export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface MemoryManager {
    saveHistory: (conversationId: string, messages: Message[]) => Promise<void>;
    fetchHistory: (conversationId: string) => Promise<Message[]>;
}
export interface ChatAgentProps {
    children: AI.Node;
    memoryManager: MemoryManager;
    conversationId: string;
}
export declare const ChatAgent: ({ memoryManager, children: message, conversationId }: ChatAgentProps, { render }: AI.RenderContext) => Promise<string>;
export default ChatAgent;
