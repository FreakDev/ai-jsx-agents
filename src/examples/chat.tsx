import * as AI from 'ai-jsx'
import ChatAgent, { MemoryManager, Message } from '../chat-agent.js'
import { Ollama } from 'ai-jsx-model-providers'

const memory: MemoryManager & { _history: Message[] } = {
  _history: [{
    role: 'system',
    content: `You are a stubborn assistant who refuses to help or answer any question unless the topic is poetry. 
If question or request is not about poetry you MUST decline`
  }],
  saveHistory: async (_, messages) => { memory._history = messages },
  fetchHistory: async (_) => { return memory._history }
}

const App = ({ children }: { children: AI.Node }) => {
  return <Ollama model='mistral'>
    <ChatAgent memoryManager={memory} conversationId={''}>
      {children}
    </ChatAgent>
  </Ollama>
}

const renderContext = AI.createRenderContext({})

let response = await renderContext.render(<App>What is the capital of France ?</App>)

console.log(response)

response = await renderContext.render(<App>could you give me a hint by writing a haiku about the answer ?</App>)

console.log(response)