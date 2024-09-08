import { UIState } from "@/app/actions";

interface Messageprops {
  messages: UIState
}

export function ChatList({ messages }: Messageprops) {
  if (!messages.length) return null;

  return (
    <div className="rlative mx-auto max-w-2xl px-4">
      {messages.map((message) => (
        <div key={message.id} className="pb-4">
          {message.display}
        </div>
      ))}
    </div>
  )

}
