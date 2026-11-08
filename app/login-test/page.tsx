
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginTestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        `Login successful! Welcome, ${data.user.email}. Your session is active.`
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-zinc-900 p-8"
      >
        <h1 className="text-3xl font-bold">DekuLink</h1>
        <p className="text-zinc-400">Temporary login test</p>

        <div>
          <label className="mb-2 block text-sm">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>

        {message && (
          <p className="break-words text-sm text-violet-300" role="status">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
