import * as AI from 'ai-jsx';
export interface Tool<Input = any, Output = any> {
    name: string;
    description: string;
    inputDescription?: string;
    callback: (input: Input) => Promise<Output>;
}
interface MrklAgentProps {
    tools: Tool[];
    children: AI.Node;
}
export declare const MrklAgent: ({ tools, children: question }: MrklAgentProps, { render }: AI.RenderContext) => Promise<string | undefined>;
export default MrklAgent;
