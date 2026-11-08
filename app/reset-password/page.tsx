
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Password updated successfully! You can now log in.");
      setPassword("");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-zinc-900 p-8"
      >
        <h1 className="text-3xl font-bold">DekuLink</h1>
        <p className="text-zinc-400">Choose your new password</p>

        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black p-3 outline-none"
          placeholder="New password (minimum 8 characters)"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update password"}
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
