import { jsx as _jsx } from "ai-jsx/jsx-runtime";
import * as AI from 'ai-jsx';
import { Ollama } from 'ai-jsx-model-providers';
import { MrklAgent } from '../index.js';
const App = async ({ children }) => {
    const tools = [
        {
            name: 'whatDate',
            description: 'use this tool to get the current date',
            callback: async () => { return `current date is ${Date.now()}`; }
        },
        {
            name: 'gpsService',
            description: 'get the current location',
            callback: async () => { }
        },
        {
            name: 'weatherForecast',
            description: 'get weather forecast for a given date',
            inputDescription: 'a JSON structure that looks like { "date": "the date for which you need forecast" }',
            callback: async (input) => { return `for the ${input.date} the weather is clear !`; }
        },
        {
            name: 'meaningOf',
            description: 'helps you find the meaning of anything',
            inputDescription: 'a JSON structure that looks  { "key": "what you need help find the meaning of" }',
            callback: async () => { }
        },
        {
            name: 'samlltalk',
            description: 'generate small talk response to have a nice conversation',
            inputDescription: 'a JSON structure that looks  { "key": "user\'s question or saying" }',
            callback: async () => { }
        },
    ];
    return _jsx(Ollama, { model: 'mistral', children: _jsx(MrklAgent, { tools: tools, children: children }) });
};
const renderContext = AI.createRenderContext();
const result = await renderContext.render(_jsx(App, { children: "What the weather like today ?" }));
console.log(result);
