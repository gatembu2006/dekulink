
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterTestPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const cleanUsername = username.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
      setMessage(
        "Username must be 3–24 characters and contain only letters, numbers or underscores."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: cleanUsername,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user) {
        setMessage(
          "Registration successful! Check your email to verify your account."
        );
      } else {
        setMessage("Registration submitted. Check your email.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-zinc-900 p-8"
      >
        <h1 className="text-3xl font-bold">DekuLink</h1>
        <p className="text-zinc-400">Temporary registration test</p>

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
          <label className="mb-2 block text-sm">Choose a username</label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={24}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
            placeholder="your_username"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
            placeholder="At least 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create test account"}
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
