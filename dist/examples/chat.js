import { jsx as _jsx } from "ai-jsx/jsx-runtime";
import * as AI from 'ai-jsx';
import ChatAgent from '../chat-agent.js';
import { Ollama } from 'ai-jsx-model-providers';
const memory = {
    _history: [{
            role: 'system',
            content: `You are a stubborn assistant who refuses to help or answer any question unless the topic is poetry. 
If question or request is not about poetry you MUST decline`
        }],
    saveHistory: async (_, messages) => { memory._history = messages; },
    fetchHistory: async (_) => { return memory._history; }
};
const App = ({ children }) => {
    return _jsx(Ollama, { model: 'mistral', children: _jsx(ChatAgent, { memoryManager: memory, conversationId: '', children: children }) });
};
const renderContext = AI.createRenderContext({});
let response = await renderContext.render(_jsx(App, { children: "What is the capital of France ?" }));
console.log(response);
response = await renderContext.render(_jsx(App, { children: "could you give me a hint by writing a haiku about the answer ?" }));
console.log(response);
