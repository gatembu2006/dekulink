
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type SneakLinkPost = {
  id: string;
  content: string;
  created_at: string;
};

export default function SneakLinksPage() {
  const [posts, setPosts] = useState<SneakLinkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);

  const [selectedPost, setSelectedPost] =
    useState<SneakLinkPost | null>(null);

  const [initialMessage, setInitialMessage] = useState("");
  const [startingConversation, setStartingConversation] =
    useState(false);

  const [supabase] = useState(() => createClient());

  // LOAD POSTS AND CHECK AUTHENTICATED USER
  async function loadPosts() {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      setError("Please log in to view SneakLinks.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("get_sneaklink_feed");

    if (error) {
      setError(error.message);
    } else {
      setPosts((data ?? []) as SneakLinkPost[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function initializeSneakLinks() {
      const { data, error } = await supabase.auth.getUser();

      console.log("DEKULINK AUTHENTICATION:", {
        authenticated: !!data.user,
        userId: data.user?.id ?? null,
        email: data.user?.email ?? null,
        error: error?.message ?? null,
      });

      await loadPosts();
    }

    initializeSneakLinks();
  }, [supabase]);

  // CREATE ANONYMOUS POST
  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = postContent.trim();

    if (!content || posting) return;

    setPosting(true);
    setError("");
    setNotice("");

    const { error } = await supabase.rpc("create_sneaklink_post", {
      post_content: content,
    });

    if (error) {
      setError(error.message);
    } else {
      setPostContent("");
      setNotice("Your anonymous post has been published.");
      await loadPosts();
    }

    setPosting(false);
  }

  // START ANONYMOUS CONVERSATION
  async function startConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = initialMessage.trim();

    if (!selectedPost || !message || startingConversation) return;

    setStartingConversation(true);
    setError("");
    setNotice("");

    // STEP 1: GET CURRENT AUTHENTICATED USER
    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    const currentUserId = userData.user?.id ?? null;

    // STEP 2: LOG SELECTED POST AND USER
    console.log("========== SNEAKLINK REPLY DEBUG ==========");

    console.log("CURRENT AUTHENTICATED USER:", currentUserId);

    console.log("CURRENT USER EMAIL:", userData.user?.email ?? null);

    console.log("SELECTED POST ID:", selectedPost.id);

    console.log("SELECTED POST CONTENT:", selectedPost.content);

    console.log("AUTHENTICATION ERROR:", userError?.message ?? null);

    // STEP 3: SEND THE REQUEST TO SUPABASE
    const { data, error } = await supabase.rpc(
      "start_sneaklink_conversation",
      {
        target_post_id: selectedPost.id,
        initial_message: message,
      }
    );

    // STEP 4: LOG THE RESULT
    console.log("RPC RESPONSE DATA:", data);

    console.log("RPC RESPONSE ERROR:", error);

    console.log("RPC ERROR MESSAGE:", error?.message ?? null);

    console.log("========== END SNEAKLINK REPLY DEBUG ==========");

    if (error) {
      setError(error.message);
    } else {
      setNotice(
        "Your anonymous message has been sent. You can continue the conversation in your inbox."
      );

      setSelectedPost(null);
      setInitialMessage("");
    }

    setStartingConversation(false);
  }

  return (
    <main className="min-h-screen bg-[#071426] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            DEKULINK ANONYMOUS SPACE
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Sneak<span className="text-[#168BFF]">Links</span>
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#A9BED8] sm:text-base">
            Your anonymous campus lounge. Say what's on your mind.
          </p>
        </header>

        {/* CREATE POST */}
        <form
          onSubmit={createPost}
          className="mb-8 rounded-2xl border border-[#1D3A5D] bg-[#10243D] p-5 shadow-xl shadow-black/20 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-xl text-blue-400">
              ✎
            </div>

            <div>
              <h2 className="font-bold text-white">
                What's on your mind?
              </h2>

              <p className="text-xs text-[#91A9C5]">
                Share something anonymously.
              </p>
            </div>
          </div>

          <textarea
            value={postContent}
            onChange={(event) => setPostContent(event.target.value)}
            placeholder="Post anonymously to the campus..."
            maxLength={1000}
            rows={4}
            className="w-full resize-none rounded-xl border border-[#29496C] bg-[#09182B] p-4 text-sm leading-6 text-white placeholder:text-[#7188A4] outline-none transition focus:border-[#168BFF] focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-[#91A9C5]">
              {postContent.length}/1000
            </span>

            <button
              type="submit"
              disabled={posting || !postContent.trim()}
              className="rounded-xl bg-gradient-to-r from-[#168BFF] to-[#0066E6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {posting ? "Publishing..." : "Post anonymously"}
            </button>
          </div>
        </form>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {notice && (
          <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200">
            {notice}{" "}
            {notice.includes("inbox") && (
              <a
                href="/messages"
                className="font-bold text-[#168BFF] underline underline-offset-4"
              >
                Open inbox
              </a>
            )}
          </div>
        )}

        {/* FEED HEADER */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Campus feed
            </h2>

            <p className="mt-1 text-xs text-[#91A9C5]">
              Thoughts from your campus community
            </p>
          </div>

          <button
            onClick={loadPosts}
            disabled={loading}
            className="rounded-lg border border-[#29496C] bg-[#10243D] px-4 py-2 text-sm font-semibold text-[#168BFF] transition hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-50"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-[#1D3A5D] bg-[#10243D] py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#29496C] border-t-[#168BFF]" />

            <p className="text-sm text-[#A9BED8]">
              Loading SneakLinks...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-[#1D3A5D] bg-[#10243D] px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-[#168BFF]">
              ?
            </div>

            <h3 className="font-bold text-white">
              No posts yet
            </h3>

            <p className="mt-2 text-sm text-[#91A9C5]">
              Be the first to start a conversation on campus.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-[#1D3A5D] bg-[#10243D] p-5 shadow-lg shadow-black/10 transition hover:border-[#28517D] sm:p-6"
              >
                {/* POST AUTHOR */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/15 text-lg font-bold text-[#168BFF]">
                    ?
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Anonymous student
                    </p>

                    <p className="mt-0.5 text-xs text-[#829BB8]">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>

                  <span className="ml-auto rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Anonymous
                  </span>
                </div>

                {/* POST CONTENT */}
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#E3EDF9] sm:text-base">
                  {post.content}
                </p>

                {/* POST ACTION */}
                <div className="mt-5 border-t border-[#29415F] pt-4">
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setInitialMessage("");
                      setError("");
                      setNotice("");

                      console.log("POST SELECTED FOR REPLY:", post);
                    }}
                    className="rounded-xl bg-[#168BFF] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-[#0875E5]"
                  >
                    Message anonymously
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* START ANONYMOUS CONVERSATION MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#29496C] bg-[#10243D] p-6 shadow-2xl shadow-black/50">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Start anonymously
                </h2>

                <p className="mt-1 text-xs text-[#91A9C5]">
                  Your identity stays hidden.
                </p>
              </div>

              <button
                onClick={() => setSelectedPost(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B3552] text-xl text-[#A9BED8] transition hover:bg-red-500/20 hover:text-red-400"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* ORIGINAL POST */}
            <div className="mb-5 rounded-xl border border-[#29496C] bg-[#09182B] p-4">
              <p className="mb-2 text-[10px] font-bold tracking-wider text-[#168BFF]">
                REPLYING TO AN ANONYMOUS POST
              </p>

              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#DCE9F8]">
                {selectedPost.content}
              </p>
            </div>

            <form onSubmit={startConversation}>
              <label className="mb-2 block text-sm font-semibold text-white">
                Your first anonymous message
              </label>

              <textarea
                value={initialMessage}
                onChange={(event) => setInitialMessage(event.target.value)}
                placeholder="Say something..."
                maxLength={3000}
                rows={4}
                autoFocus
                className="w-full resize-none rounded-xl border border-[#29496C] bg-[#09182B] p-4 text-sm leading-6 text-white placeholder:text-[#7188A4] outline-none transition focus:border-[#168BFF] focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="mt-2 flex justify-between gap-3 text-xs text-[#829BB8]">
                <span>Both identities stay hidden initially.</span>
                <span>{initialMessage.length}/3000</span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="rounded-xl border border-[#29496C] px-5 py-3 text-sm font-semibold text-[#A9BED8] transition hover:bg-[#1B3552]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    startingConversation || !initialMessage.trim()
                  }
                  className="rounded-xl bg-gradient-to-r from-[#168BFF] to-[#0066E6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {startingConversation
                    ? "Sending..."
                    : "Send message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
