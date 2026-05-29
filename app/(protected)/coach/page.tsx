"use client";

import { useEffect, useRef, useState } from "react";
import { ChatComposer } from "@/app/components/ui/chat-composer";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { apiPost } from "@/lib/client/api-client";
import type { CoachChatMessage, CoachChatResponse } from "@/lib/client/types";

const examplePrompts = [
  "What should I improve from my last sessions?",
  "How do I practice this G chord cleanly?",
  "how to read tabs?",
  "whats the difference between a minor and a major chord?",
];

export default function CoachPage() {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function sendMessage(content: string) {
    const cleanContent = content.trim();
    if (!cleanContent || sending) {
      return;
    }

    const nextMessages: CoachChatMessage[] = [...messages, { role: "user", content: cleanContent }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setSending(true);

    const result = await apiPost<CoachChatResponse>("/api/chat", {
      messages: nextMessages.slice(-20),
    });

    setSending(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setMessages([...nextMessages, { role: "assistant", content: result.data.reply }]);
  }

  return (
    <PageShell width="7xl" className="page-section-reveal space-y-8">
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <section className="space-y-5">
          <PageHeading
            title="Practice Coach"
            description="Ask focused questions about guitar practice, technique, your saved sessions, goals, and feedback."
          />

          <SurfaceCard className="space-y-4">
            <div>
              <p className="text-sm font-semibold tracking-tight text-zinc-950">Try a question</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The coach reads your profile and recent sessions when answering.
              </p>
            </div>
            <div className="grid gap-2">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={sending}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium leading-5 text-slate-800 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.75)] transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-200 hover:bg-emerald-50/50 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </SurfaceCard>
        </section>

        <SurfaceCard className="h-[calc(100dvh-9rem)] min-h-[620px] max-h-[900px] p-0 sm:p-0">
          <div className="flex h-full min-h-0 flex-col">
            <div className="shrink-0 border-b border-slate-200/70 px-5 py-4 sm:px-6">
              <p className="text-sm font-semibold tracking-tight text-zinc-950">Music-only assistant</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Questions outside music practice or Practice Arena are refused.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-5 sm:px-6">
              {messages.length === 0 ? (
                <div className="flex min-h-full items-center justify-center">
                  <div className="max-w-md text-center">
                    <p className="text-lg font-semibold tracking-tight text-zinc-950">Ready when your hands are.</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Ask about cleaner chord changes, how to practice a task, or what your recent feedback suggests.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isUser = message.role === "user";
                    return (
                      <div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.5)] ${
                            isUser
                              ? "bg-zinc-950 text-white"
                              : "border border-slate-200/70 bg-slate-50 text-slate-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  {sending ? (
                    <div className="flex justify-start">
                      <div className="rounded-[1.35rem] border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Thinking through your practice data...
                      </div>
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-200/70 px-4 py-4 sm:px-6">
              {error ? <InlineStatus message={error} variant="error" className="mb-3" /> : null}
              <ChatComposer
                disabled={sending}
                maxLength={2000}
                onChange={setDraft}
                onSubmit={() => void sendMessage(draft)}
                placeholder="Ask about music practice or your saved sessions..."
                sendingLabel="Sending..."
                value={draft}
              />
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
