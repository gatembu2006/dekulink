
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type SneakConversation = {
  conversation_id: string;
  post_content: string;
  conversation_created_at: string;
  last_message_at: string;
  is_incoming: boolean;
  type: "sneaklink";
};

type DirectConversation = {
  conversation_id: string;
  other_user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  last_message_preview: string | null;
  last_message_at: string;
  type: "direct";
};

type InboxConversation = SneakConversation | DirectConversation;

type Message = {
  message_id: string;
  is_mine: boolean;
  message_content: string;
  message_created_at: string;
};

type RevealedIdentity = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type SelectedConversation = {
  id: string;
  type: "sneaklink" | "direct";
};

const blueButton =
  "rounded-xl bg-gradient-to-r from-[#168BFF] to-[#0066E6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40";

const panel = "border border-[#1D3A5D] bg-[#10243D]";

export default function MessagesPage() {
  const [supabase] = useState(() => createClient());

  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [identities, setIdentities] = useState<RevealedIdentity[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<SelectedConversation | null>(null);

  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [ownRevealSubmitted, setOwnRevealSubmitted] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // LOAD INBOX
  const loadInbox = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    console.log("DEKULINK AUTH CHECK", {
      sessionUserId: sessionData.session?.user.id,
      verifiedUserId: userData.user?.id,
      email: userData.user?.email,
      error: userError?.message,
    });

    if (!sessionData.session) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    setLoggedIn(true);
    setError("");

    const [sneakResult, directResult] = await Promise.all([
      supabase.rpc("get_sneaklink_inbox"),
      supabase.rpc("get_direct_inbox"),
    ]);

    const combined: InboxConversation[] = [];

    if (sneakResult.error) {
      setError(sneakResult.error.message);
    } else {
      const sneakConversations = (sneakResult.data ?? []).map(
        (conversation: Omit<SneakConversation, "type">) => ({
          ...conversation,
          type: "sneaklink" as const,
        })
      );

      combined.push(...sneakConversations);
    }

    if (directResult.error) {
      setError(
        (current) =>
          current ||
          directResult.error?.message ||
          "Could not load direct messages."
      );
    } else {
      const directConversations = (directResult.data ?? []).map(
        (conversation: Omit<DirectConversation, "type">) => ({
          ...conversation,
          type: "direct" as const,
        })
      );

      combined.push(...directConversations);
    }

    combined.sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime()
    );

    setConversations(combined);

    setSelectedConversation((current) => {
      if (
        current &&
        combined.some(
          (conversation) =>
            conversation.conversation_id === current.id &&
            conversation.type === current.type
        )
      ) {
        return current;
      }

      const first = combined[0];

      return first
        ? { id: first.conversation_id, type: first.type }
        : null;
    });

    setLoading(false);
  }, [supabase]);

  // LOAD CHAT MESSAGES
  const loadMessages = useCallback(
    async (conversation: SelectedConversation) => {
      const functionName =
        conversation.type === "direct"
          ? "get_direct_messages"
          : "get_sneaklink_messages";

      const { data, error } = await supabase.rpc(functionName, {
        target_conversation_id: conversation.id,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessages((data ?? []) as Message[]);
    },
    [supabase]
  );

  // LOAD REVEALED IDENTITIES
  const loadIdentities = useCallback(
    async (conversationId: string) => {
      const { data, error } = await supabase.rpc(
        "get_sneaklink_revealed_identities",
        { target_conversation_id: conversationId }
      );

      if (error) {
        setError(error.message);
        return;
      }

      setIdentities((data ?? []) as RevealedIdentity[]);
    },
    [supabase]
  );

  // INITIAL INBOX LOAD
  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  // REALTIME SUBSCRIPTIONS
  useEffect(() => {
    let active = true;

    const refreshConversation = async (
      type: "direct" | "sneaklink",
      conversationId?: string
    ) => {
      if (!active) return;

      // Update the inbox and latest-message previews.
      await loadInbox();

      // Update the open conversation when the new message belongs to it.
      if (
        active &&
        conversationId &&
        selectedConversation?.type === type &&
        selectedConversation.id === conversationId
      ) {
        await loadMessages(selectedConversation);
      }
    };

    const channel = supabase
      .channel("dekulink-messages-inbox")

      // DIRECT MESSAGES
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const newConversationId = (
            payload.new as { conversation_id?: string }
          ).conversation_id;

          console.log("NEW DIRECT MESSAGE:", payload.new);

          void refreshConversation("direct", newConversationId);
        }
      )

      // SNEAKLINK MESSAGES
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sneaklink_messages",
        },
        (payload) => {
          const newConversationId = (
            payload.new as { conversation_id?: string }
          ).conversation_id;

          console.log("NEW SNEAKLINK MESSAGE:", payload.new);

          void refreshConversation("sneaklink", newConversationId);
        }
      )

      .subscribe((status, subscriptionError) => {
        console.log("DEKULINK INBOX REALTIME STATUS:", status);

        if (subscriptionError) {
          console.error(
            "DEKULINK INBOX REALTIME ERROR:",
            subscriptionError
          );
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase, selectedConversation, loadInbox, loadMessages]);

  // LOAD SELECTED CONVERSATION
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setIdentities([]);
      setOwnRevealSubmitted(false);
      return;
    }

    setError("");
    setNotice("");
    setOwnRevealSubmitted(false);
    setMessages([]);
    setIdentities([]);

    void loadMessages(selectedConversation);

    if (selectedConversation.type === "sneaklink") {
      void loadIdentities(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages, loadIdentities]);

  // SEND MESSAGE
  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = messageInput.trim();

    if (!content || !selectedConversation || sending) return;

    setSending(true);
    setError("");
    setNotice("");

    const functionName =
      selectedConversation.type === "direct"
        ? "send_direct_message"
        : "send_sneaklink_message";

    const { error } = await supabase.rpc(functionName, {
      target_conversation_id: selectedConversation.id,
      message_content: content,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessageInput("");
      await loadMessages(selectedConversation);
      await loadInbox();
    }

    setSending(false);
  }

  // REVEAL SNEAKLINK IDENTITY
  async function revealIdentity() {
    if (
      !selectedConversation ||
      selectedConversation.type !== "sneaklink" ||
      revealing
    ) {
      return;
    }

    setRevealing(true);
    setError("");
    setNotice("");

    const { data, error } = await supabase.rpc(
      "reveal_sneaklink_identity",
      { target_conversation_id: selectedConversation.id }
    );

    if (error) {
      setError(error.message);
    } else if (data === true) {
      setOwnRevealSubmitted(true);
      setNotice("Both participants have revealed their identities!");
      await loadIdentities(selectedConversation.id);
    } else {
      setOwnRevealSubmitted(true);
      setNotice(
        "Your identity reveal has been submitted. Waiting for the other participant."
      );
    }

    setRevealing(false);
  }

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#29496C] border-t-[#168BFF]" />
          <p className="text-sm text-[#A9BED8]">
            Loading your messages...
          </p>
        </div>
      </main>
    );
  }

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#071426] text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl text-[#168BFF]">
          ✉
        </div>

        <h1 className="text-2xl font-bold">Please log in</h1>

        <p className="text-sm text-[#91A9C5]">
          Log in to access your DekuLink conversations.
        </p>

        <a href="/login" className={blueButton}>
          Go to login
        </a>
      </main>
    );
  }

  const bothRevealed = identities.length >= 2;

  const selectedDetails = selectedConversation
    ? conversations.find(
        (conversation) =>
          conversation.conversation_id === selectedConversation.id &&
          conversation.type === selectedConversation.type
      )
    : null;

  const directDetails =
    selectedDetails?.type === "direct" ? selectedDetails : null;

  const sneakDetails =
    selectedDetails?.type === "sneaklink" ? selectedDetails : null;

  const directCount = conversations.filter(
    (conversation) => conversation.type === "direct"
  ).length;

  const sneakCount = conversations.filter(
    (conversation) => conversation.type === "sneaklink"
  ).length;

  return (
    <main className="min-h-screen bg-[#071426] p-3 text-white sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#168BFF]">
              DEKULINK
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Messages
            </h1>

            <p className="mt-2 text-sm text-[#91A9C5]">
              Your campus conversations, all in one place.
            </p>
          </div>

          <button
            onClick={() => void loadInbox()}
            className="rounded-xl border border-[#29496C] bg-[#10243D] px-4 py-3 text-sm font-semibold text-[#168BFF] transition hover:border-[#168BFF] hover:bg-blue-500/10"
          >
            ↻ Refresh inbox
          </button>
        </header>

        {/* CONVERSATION COUNTS */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className={`rounded-2xl p-4 ${panel}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#91A9C5]">
                Direct messages
              </p>

              <span className="text-lg text-[#168BFF]">✉</span>
            </div>

            <p className="mt-2 text-2xl font-extrabold text-white">
              {directCount}
            </p>
          </div>

          <div className={`rounded-2xl p-4 ${panel}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#91A9C5]">
                SneakLinks
              </p>

              <span className="text-lg text-[#168BFF]">◉</span>
            </div>

            <p className="mt-2 text-2xl font-extrabold text-white">
              {sneakCount}
            </p>
          </div>
        </div>

        {/* FEEDBACK */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200">
            {notice}
          </div>
        )}

        {/* UNIFIED INBOX */}
        <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-[#1D3A5D] bg-[#0B1B2F] shadow-2xl shadow-black/20 md:grid-cols-[340px_1fr]">

          {/* CONVERSATION LIST */}
          <aside className="border-b border-[#1D3A5D] md:border-b-0 md:border-r">
            <div className="border-b border-[#1D3A5D] bg-[#10243D] p-5">
              <h2 className="font-bold text-white">Your inbox</h2>

              <p className="mt-1 text-xs text-[#91A9C5]">
                {conversations.length} conversations
              </p>
            </div>

            {conversations.length === 0 ? (
              <div className="p-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-[#168BFF]">
                  ✉
                </div>

                <p className="font-semibold text-white">
                  No conversations yet.
                </p>

                <p className="mt-2 text-sm leading-6 text-[#91A9C5]">
                  Discover students to start a direct message, or explore
                  SneakLinks to chat anonymously.
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <a href="/discover" className={blueButton}>
                    Discover students
                  </a>

                  <a
                    href="/sneaklinks"
                    className="rounded-xl border border-[#29496C] px-4 py-3 text-sm font-semibold text-[#A9BED8] transition hover:bg-blue-500/10 hover:text-white"
                  >
                    Explore SneakLinks
                  </a>
                </div>
              </div>
            ) : (
              <div className="max-h-[650px] overflow-y-auto">
                {conversations.map((conversation) => {
                  const isSelected =
                    selectedConversation?.id === conversation.conversation_id &&
                    selectedConversation?.type === conversation.type;

                  const isDirect = conversation.type === "direct";

                  return (
                    <button
                      key={`${conversation.type}-${conversation.conversation_id}`}
                      onClick={() => {
                        setSelectedConversation({
                          id: conversation.conversation_id,
                          type: conversation.type,
                        });
                      }}
                      className={`w-full border-b border-[#1D3A5D]/70 p-4 text-left transition hover:bg-[#152D49] ${
                        isSelected
                          ? "border-l-4 border-l-[#168BFF] bg-blue-500/10"
                          : "border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isDirect && conversation.avatar_url ? (
                          <img
                            src={conversation.avatar_url}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full border border-[#29496C] object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/15 text-lg font-bold text-[#168BFF]">
                            {isDirect
                              ? (
                                  conversation.display_name ||
                                  conversation.username ||
                                  "?"
                                )
                                  .charAt(0)
                                  .toUpperCase()
                              : "?"}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-bold text-white">
                              {isDirect
                                ? conversation.display_name ||
                                  conversation.username ||
                                  "DekuLink Student"
                                : "Anonymous participant"}
                            </p>

                            <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[9px] font-bold tracking-wide text-[#168BFF]">
                              {isDirect ? "DIRECT" : "SNEAKLINK"}
                            </span>
                          </div>

                          {isDirect && conversation.username && (
                            <p className="mt-0.5 truncate text-xs text-[#829BB8]">
                              @{conversation.username}
                            </p>
                          )}

                          <p className="mt-1 truncate text-xs text-[#A9BED8]">
                            {isDirect
                              ? conversation.last_message_preview ||
                                "Start chatting"
                              : conversation.post_content}
                          </p>

                          <p className="mt-2 text-[10px] text-[#7188A4]">
                            {new Date(
                              conversation.last_message_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* CHAT WINDOW */}
          <section className="flex min-h-[650px] flex-col bg-[#09182B]">
            {!selectedConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#29496C] bg-blue-500/10 text-3xl text-[#168BFF]">
                  ✉
                </div>

                <h2 className="text-xl font-bold text-white">
                  Your conversations
                </h2>

                <p className="mt-2 max-w-sm text-sm text-[#91A9C5]">
                  Select a conversation to start messaging.
                </p>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}
                <div className="border-b border-[#1D3A5D] bg-[#10243D] p-4">
                  {directDetails ? (
                    <div className="flex items-center gap-3">
                      {directDetails.avatar_url ? (
                        <img
                          src={directDetails.avatar_url}
                          alt=""
                          className="h-11 w-11 rounded-full border border-[#29496C] object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15 font-bold text-[#168BFF]">
                          {(
                            directDetails.display_name ||
                            directDetails.username ||
                            "?"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-white">
                          {directDetails.display_name ||
                            directDetails.username ||
                            "DekuLink Student"}
                        </h2>

                        <p className="text-xs text-[#91A9C5]">
                          {directDetails.username
                            ? `@${directDetails.username}`
                            : "Direct message"}
                        </p>
                      </div>

                      <span className="ml-auto shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-[#168BFF]">
                        DIRECT MESSAGE
                      </span>
                    </div>
                  ) : sneakDetails ? (
                    bothRevealed ? (
                      <div>
                        <div className="mb-3 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold tracking-wide text-[#168BFF]">
                          IDENTITIES REVEALED
                        </div>

                        <div className="flex flex-wrap gap-4">
                          {identities.map((person) => (
                            <div
                              key={person.id}
                              className="flex items-center gap-3"
                            >
                              {person.avatar_url ? (
                                <img
                                  src={person.avatar_url}
                                  alt=""
                                  className="h-10 w-10 rounded-full border border-[#29496C] object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 font-bold text-[#168BFF]">
                                  {(
                                    person.display_name ||
                                    person.username ||
                                    "?"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-white">
                                  {person.display_name ||
                                    person.username ||
                                    "Student"}
                                </p>

                                {person.username && (
                                  <p className="text-xs text-[#91A9C5]">
                                    @{person.username}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="font-bold text-white">
                            Anonymous conversation
                          </h2>

                          <p className="mt-1 text-sm text-[#91A9C5]">
                            Your identities remain hidden until both people
                            reveal.
                          </p>
                        </div>

                        <button
                          onClick={revealIdentity}
                          disabled={revealing || ownRevealSubmitted}
                          className={blueButton}
                        >
                          {revealing
                            ? "Submitting..."
                            : ownRevealSubmitted
                              ? "Reveal submitted"
                              : "Reveal my identity"}
                        </button>
                      </div>
                    )
                  ) : null}
                </div>

                {/* MESSAGE HISTORY */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-[#09182B] p-4 sm:p-6">
                  {messages.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-xl text-[#168BFF]">
                        ✉
                      </div>

                      <p className="text-sm text-[#91A9C5]">
                        No messages yet. Start the conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.message_id}
                        className={`flex ${
                          message.is_mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                            message.is_mine
                              ? "rounded-br-sm bg-gradient-to-br from-[#168BFF] to-[#0066E6] text-white shadow-lg shadow-blue-600/10"
                              : "rounded-bl-sm border border-[#29496C] bg-[#142B45] text-[#E3EDF9]"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.message_content}
                          </p>

                          <p className="mt-2 text-right text-[10px] text-white/60">
                            {new Date(
                              message.message_created_at
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* MESSAGE INPUT */}
                <form
                  onSubmit={sendMessage}
                  className="flex gap-2 border-t border-[#1D3A5D] bg-[#10243D] p-3 sm:p-4"
                >
                  <input
                    value={messageInput}
                    onChange={(event) =>
                      setMessageInput(event.target.value)
                    }
                    placeholder={
                      selectedConversation.type === "direct"
                        ? "Write a message..."
                        : "Write an anonymous message..."
                    }
                    maxLength={5000}
                    className="min-w-0 flex-1 rounded-xl border border-[#29496C] bg-[#09182B] px-4 py-3 text-sm text-white outline-none placeholder:text-[#7188A4] transition focus:border-[#168BFF] focus:ring-2 focus:ring-blue-500/20"
                  />

                  <button
                    type="submit"
                    disabled={sending || !messageInput.trim()}
                    className="rounded-xl bg-gradient-to-r from-[#168BFF] to-[#0066E6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
