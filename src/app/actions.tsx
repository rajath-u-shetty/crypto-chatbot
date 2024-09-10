"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc"
import type { CoreMessage, ToolInvocation } from "ai"
import type { ReactNode } from "react";
import { openai } from "@ai-sdk/openai"
import { BotMessage } from "@/components/llm/message";
import { Loader2 } from "lucide-react";

const content = `\
You are a crypto bot and you can help users get the prices of cryptocurrencies.

Messages inside [] means that it's a UI element or a user event. For example:
- "[Price of BTC = 69000]" means that the interface of the cryptocurrency price of BTC is shown to the user.

If the user wants the price, call \`get_crypto_price\` to show the price.
If the user wants the market cap or other stats of a given cryptocurrency, call \`get_crypto_stats\` to show the stats.
If the user wants a stock price, it is an impossible task, so you should respond that you are a demo and cannot do that.
If the user wants to do anything else, it is an impossible task, so you should respond that you are a demo and cannot do that.

Besides getting prices of cryptocurrencies, you can also chat with users.
`;

export const sendMessage = async (message: string): Promise<{
  id: number;
  role: 'user' | 'assistant';
  display: ReactNode;
}> => {

  const history = getMutableAIState<typeof AI>()

  history.update([
    ...history.get(),
    {
      role: 'user',
      content: message,
    }
  ])

  const relpy = await streamUI({
    model: openai("gpt-3.5-turbo"),
    messages: [
      { role: "user", content, toolInvocation: [] },
      ...history.get(),
    ] as CoreMessage[],
    initial: (
      <BotMessage className="items-center flex shrink-0 select-none justify-center">
        <Loader2 className="h-5 w-5 animate-spin stroke-zinc-900" />
      </BotMessage>
    ),

  })


  return {
    id: Date.now(),
    role: 'assistant',
    display: <div>Hello</div>,
  };
};

export type AIState = Array<{
  id?: number,
  name?: "get_crypto_price" | "get_crypto_stats",
  role: "user" | "assistant" | "system",
  content: string,
}>

export type UIState = Array<{
  id: number,
  role: "user" | "assistant",
  display: ReactNode,
  toolInvocation?: ToolInvocation[],
}>

export const AI = createAI({
  initialAIState: [] as AIState,
  initialUIState: [] as UIState,
  actions: {
    sendMessage
  }
})

