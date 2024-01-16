import { Completion } from "ai-jsx/core/completion";
import * as AI from 'ai-jsx'
import _ from "lodash";

export interface Tool<Input = any, Output = any> {
  name: string,
  description: string;
  inputDescription?: string;
  callback: (input: Input) => Promise<Output>
}

interface MrklAgentProps {
  tools: Tool[]
  children: AI.Node;
}

const ACTION_PREFIX = 'Action:'
const ACTION_INPUT_PREFIX = 'Action Input:'
const OBSERVATION_PREFIX = 'Observation:'
const FINAL_ANSWER_PREFIX = 'Final Answer:'

const buildPrompt = (tools: Tool[]) => `Answer the following questions as best you can. You have access to the following tools:
${tools.map((tool) => {
  return `${tool.name} - ${tool.description} - for this tool input MUST be ${tool.inputDescription ?? 'null'}\n`
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
`

const parseLlmResponseForTool = (response: string) => {
  const responseLines = response.split("\n").map((responseLine: string) => responseLine.trim()).reverse();
  const tool = responseLines.find((responseLine: string) => responseLine.startsWith(ACTION_PREFIX))?.substring(ACTION_PREFIX.length).trim()
  if (tool) {
    const inputString = responseLines.find((responseLine: string) => responseLine.startsWith(ACTION_INPUT_PREFIX))?.substring(ACTION_INPUT_PREFIX.length).trim()
    return { tool, input: JSON.parse(inputString ?? '{}') }
  }

  return { tool: null, input: null }
}

const parseLlmResponseForFinalAnswer = (response: string) => {
  const responseLines = response.split("\n").map((responseLine: string) => responseLine.trim()).reverse();
  return responseLines.find((responseLine: string) => responseLine.startsWith(FINAL_ANSWER_PREFIX))?.substring(FINAL_ANSWER_PREFIX.length).trim() ?? ''
}

export const MrklAgent = async ({ tools, children: question }: MrklAgentProps, { render }: AI.RenderContext) => {

  const basePrompt = buildPrompt(tools)

  const LlmCompletion = ({ children }: { children: AI.Node }) => <Completion stop={[OBSERVATION_PREFIX]}>
    {basePrompt}
    {children}
  </Completion>

  let finalAnswer = ''
  let scratchPad = `Question: ${question}\n`
  while (!finalAnswer) {
    const llmResponse = await render(<LlmCompletion>
      {scratchPad}
    </LlmCompletion>)

    try {
      finalAnswer = parseLlmResponseForFinalAnswer(llmResponse)
      if (finalAnswer !== '') {
        return finalAnswer
      }

      const { tool: toolName, input } = parseLlmResponseForTool(llmResponse)

      const toolToUse = toolName ? tools.find(tool => tool.name === toolName) : null
      if (toolToUse) {
        scratchPad += `${llmResponse} ${OBSERVATION_PREFIX} ${await toolToUse.callback(input)}\n`
      }
    }
    catch {}
  }

}

export default MrklAgent