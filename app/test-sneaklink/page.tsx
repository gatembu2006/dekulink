
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestSneakLinkPage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function createPost() {
    setLoading(true);
    setResult("");

    try {
      const supabase = createClient();

      const { data: sessionData } =
        await supabase.auth.getSession();

      if (!sessionData.session) {
        setResult("Please log in first.");
        return;
      }

      const { data, error } = await supabase.rpc(
        "create_sneaklink_post",
        { post_content: content }
      );

      if (error) throw error;

      setResult(`Post created successfully! ID: ${data}`);
      setContent("");
    } catch (error) {
      setResult(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050b12] p-6 text-white">
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-2xl font-bold">SneakLinks Test</h1>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          placeholder="Write something anonymously..."
          className="w-full rounded-xl border border-white/20 bg-white/5 p-4"
          rows={5}
        />

        <button
          onClick={createPost}
          disabled={loading || !content.trim()}
          className="w-full rounded-xl bg-cyan-500 p-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post anonymously"}
        </button>

        {result && (
          <p className="break-words rounded-xl bg-white/5 p-4">
            {result}
          </p>
        )}
      </div>
    </main>
  );
}
