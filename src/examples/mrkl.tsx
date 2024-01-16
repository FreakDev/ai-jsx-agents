import * as AI from 'ai-jsx'
import { Ollama } from 'ai-jsx-model-providers'
import _ from 'lodash'
import { MrklAgent, Tool } from '../index.js';

const App = async ({children}: {children: AI.Node}) => {

  const tools: Tool[] = [
    {
      name: 'whatDate',
      description: 'use this tool to get the current date',
      callback: async () => { return `current date is ${Date.now()}` }
    },
    {
      name: 'gpsService',
      description: 'get the current location',
      callback: async () => {}
    },
    {
      name: 'weatherForecast',
      description: 'get weather forecast for a given date',
      inputDescription: 'a JSON structure that looks like { "date": "the date for which you need forecast" }',
      callback: async (input: {date: string}) => { return `for the ${input.date} the weather is clear !`}
    },
    {
      name: 'meaningOf',
      description: 'helps you find the meaning of anything',
      inputDescription: 'a JSON structure that looks  { "key": "what you need help find the meaning of" }',
      callback: async () => {}
    },
    {
      name: 'samlltalk',
      description: 'generate small talk response to have a nice conversation',
      inputDescription: 'a JSON structure that looks  { "key": "user\'s question or saying" }',
      callback: async () => {}
    },
  ];

  return <Ollama model='mistral'>
    <MrklAgent tools={tools}>
      {children}
    </MrklAgent>
  </Ollama>
}

const renderContext = AI.createRenderContext()
const result = await renderContext.render(<App>What the weather like today ?</App>)

console.log(result)

