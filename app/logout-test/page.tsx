
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutTestPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Logout successful! Your session has ended.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-zinc-900 p-8">
        <h1 className="text-3xl font-bold">DekuLink</h1>
        <p className="text-zinc-400">Temporary logout test</p>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Signing out..." : "Log out"}
        </button>

        {message && (
          <p className="text-sm text-violet-300" role="status">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
