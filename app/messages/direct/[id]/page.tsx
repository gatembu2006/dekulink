
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ChatMessage = {
  message_id: string;
  is_mine: boolean;
  message_content: string;
  message_created_at: string;
};

type ChatStudent = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export default function DirectChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [student, setStudent] = useState<ChatStudent | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [supabase] = useState(() => createClient());

  const loadChat = useCallback(async () => {
    const { data: inbox, error: inboxError } = await supabase.rpc(
      "get_direct_inbox"
    );

    if (inboxError) {
      setError(inboxError.message);
      setLoading(false);
      return;
    }

    const conversation = (inbox ?? []).find(
      (item: { conversation_id: string }) =>
        item.conversation_id === conversationId
    );

    if (!conversation) {
      setError("Conversation not found.");
      setLoading(false);
      return;
    }

    setStudent({
      username: conversation.username,
      display_name: conversation.display_name,
      avatar_url: conversation.avatar_url,
    });

    const { data, error: messageError } = await supabase.rpc(
      "get_direct_messages",
      { target_conversation_id: conversationId }
    );

    if (messageError) {
      setError(messageError.message);
    } else {
      setMessages((data ?? []) as ChatMessage[]);
      setError("");
    }

    setLoading(false);
  }, [conversationId, supabase]);

  // Initial load
  useEffect(() => {
    loadChat();
  }, [loadChat]);

  // REAL-TIME MESSAGE SUBSCRIPTION
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`direct-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("NEW DIRECT MESSAGE:", payload.new);

          // Reload messages so is_mine and RPC formatting remain correct.
          loadChat();
        }
      )
      .subscribe((status) => {
        console.log("DIRECT CHAT REALTIME STATUS:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, loadChat]);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const content = message.trim();

    if (!content || sending) return;

    setSending(true);
    setError("");

    const { error } = await supabase.rpc("send_direct_message", {
      target_conversation_id: conversationId,
      message_content: content,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("");
      await loadChat();
    }

    setSending(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        Loading conversation...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/10 bg-black px-5 py-4">
        <button
          onClick={() => router.push("/messages")}
          className="text-xl text-zinc-400 hover:text-white"
        >
          ←
        </button>

        {student?.avatar_url ? (
          <img
            src={student.avatar_url}
            alt=""
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 font-bold">
            {(student?.display_name || student?.username || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <div>
          <h1 className="font-semibold">
            {student?.display_name || "DekuLink Student"}
          </h1>
          <p className="text-xs text-zinc-500">
            @{student?.username || "student"}
          </p>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex-1 space-y-4">
          {messages.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-medium">Start the conversation</p>
              <p className="mt-2 text-sm text-zinc-500">
                Send your first message.
              </p>
            </div>
          )}

          {messages.map((item) => (
            <div
              key={item.message_id}
              className={`flex ${
                item.is_mine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  item.is_mine
                    ? "rounded-br-sm bg-indigo-600 text-white"
                    : "rounded-bl-sm bg-zinc-800 text-zinc-100"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                  {item.message_content}
                </p>

                <p className="mt-2 text-right text-[10px] opacity-60">
                  {new Date(item.message_created_at).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={sendMessage}
          className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-white/10 bg-black py-4"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            maxLength={5000}
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-zinc-900 px-5 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold transition hover:bg-indigo-500 disabled:opacity-40"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
