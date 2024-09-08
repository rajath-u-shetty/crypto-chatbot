'use client'
import { ChatList } from "@/components/ChatList";
import { ChatScrollAnchor } from "@/components/ChatScrollAnchor";
import { env } from "@/env";
import { createAI } from "ai/rsc"
import { useForm } from "react-hook-form";

export default function Home() {

  const form = useForm()

  const onSubimt = () => { }
  return (
    <main>
      <div className="pb-[200px] pt-4 md:pt-[100px]">
        <ChatList messages={[]} />
        <ChatScrollAnchor />
      </div>
      <div className="">
        <form ref={formRef} onSubmit={form.handleSubmit(onSubimt)} action="">

        </form>
      </div>
    </main>
  );
}
