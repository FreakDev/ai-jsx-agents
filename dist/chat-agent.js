import { jsx as _jsx, jsxs as _jsxs } from "ai-jsx/jsx-runtime";
import { AssistantMessage, ChatCompletion, SystemMessage, UserMessage } from 'ai-jsx/core/completion';
export const ChatAgent = async ({ memoryManager, children: message, conversationId }, { render }) => {
    const messages = await memoryManager.fetchHistory(conversationId);
    const newMessage = await render(_jsxs(ChatCompletion, { children: [messages.map(msg => {
                switch (msg.role) {
                    case 'user':
                        return _jsx(UserMessage, { children: msg.content });
                    case 'assistant':
                        return _jsx(AssistantMessage, { children: msg.content });
                    case 'system':
                        return _jsx(SystemMessage, { children: msg.content });
                }
            }), _jsx(UserMessage, { children: message })] }));
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
    ]);
    return newMessage;
};
export default ChatAgent;
