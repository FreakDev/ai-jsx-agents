import { jsxs as _jsxs, jsx as _jsx } from "ai-jsx/jsx-runtime";
import { Completion } from "ai-jsx/core/completion";
const ACTION_PREFIX = 'Action:';
const ACTION_INPUT_PREFIX = 'Action Input:';
const OBSERVATION_PREFIX = 'Observation:';
const FINAL_ANSWER_PREFIX = 'Final Answer:';
const buildPrompt = (tools) => `Answer the following questions as best you can. You have access to the following tools:
${tools.map((tool) => {
    return `${tool.name} - ${tool.description} - for this tool input MUST be ${tool.inputDescription ?? 'null'}\n`;
})}

Use the following format in your response:

Question: the input question you must answer
Thought: you should always think about what to do
${ACTION_PREFIX} the action to take, should be one of ${tools.map(tool => tool.name).join(',')}
${ACTION_INPUT_PREFIX} the input to the action
${OBSERVATION_PREFIX} the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
${FINAL_ANSWER_PREFIX} the final answer to the original input question

Begin!
`;
const parseLlmResponseForTool = (response) => {
    const responseLines = response.split("\n").map((responseLine) => responseLine.trim()).reverse();
    const tool = responseLines.find((responseLine) => responseLine.startsWith(ACTION_PREFIX))?.substring(ACTION_PREFIX.length).trim();
    if (tool) {
        const inputString = responseLines.find((responseLine) => responseLine.startsWith(ACTION_INPUT_PREFIX))?.substring(ACTION_INPUT_PREFIX.length).trim();
        return { tool, input: JSON.parse(inputString ?? '{}') };
    }
    return { tool: null, input: null };
};
const parseLlmResponseForFinalAnswer = (response) => {
    const responseLines = response.split("\n").map((responseLine) => responseLine.trim()).reverse();
    return responseLines.find((responseLine) => responseLine.startsWith(FINAL_ANSWER_PREFIX))?.substring(FINAL_ANSWER_PREFIX.length).trim() ?? '';
};
export const MrklAgent = async ({ tools, children: question }, { render }) => {
    const basePrompt = buildPrompt(tools);
    const LlmCompletion = ({ children }) => _jsxs(Completion, { stop: [OBSERVATION_PREFIX], children: [basePrompt, children] });
    let finalAnswer = '';
    let scratchPad = `Question: ${question}\n`;
    while (!finalAnswer) {
        const llmResponse = await render(_jsx(LlmCompletion, { children: scratchPad }));
        try {
            finalAnswer = parseLlmResponseForFinalAnswer(llmResponse);
            if (finalAnswer !== '') {
                return finalAnswer;
            }
            const { tool: toolName, input } = parseLlmResponseForTool(llmResponse);
            const toolToUse = toolName ? tools.find(tool => tool.name === toolName) : null;
            if (toolToUse) {
                scratchPad += `${llmResponse} ${OBSERVATION_PREFIX} ${await toolToUse.callback(input)}\n`;
            }
        }
        catch { }
    }
};
export default MrklAgent;
