"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc"
import type { CoreMessage, ToolInvocation } from "ai"
import type { ReactNode } from "react";
import { openai } from "@ai-sdk/openai"
import { BotCard, BotMessage } from "@/components/llm/message";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { env } from "@/env";
import { MainClient } from 'binance';

const binance = new MainClient({
  api_key: env.BINANCE_API_KEY,
  api_secret: env.BINANCE_API_SECRET,
});

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

  const reply = await streamUI({
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
    text: ({ content, done }) => {
      if (done) history.done([...history.get(), { role: 'assistant', content }]);

      return <BotMessage>{content}</BotMessage>;
    },
    temperature: 0,
    tools: {
      get_crypto_price: {
        description:
          "Get the current price of a given cryptocurrency. Use this to show the price to the user.",
        parameters: z.object({
          symbol: z.string().describe("The name or symbol of the cryptocurrency. e.g. BTC/ETH/SOL.")
        }),
        generate: async function*({ symbol }: { symbol: string }) {
          console.log(symbol)
          yield (
            <BotCard>
              Loading..
            </BotCard>
          )

          return null;
        }
      },
      get_crypto_stats: {
        description: "Get the current stats of a given cryptocurrency. Use this to show the stats to the user.",
        parameters: z.object({
          slug: z.string().describe("The full name of the cryptocurrency in lowercase. e.g. bitcoin/ethereum/solana.")
        }),
      },
    }
  })


  return {
    id: Date.now(),
    role: 'assistant',
    display: reply.value,
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

