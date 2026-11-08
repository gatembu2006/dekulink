
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login-test";
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, display_name, bio")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage("Could not load your profile: " + error.message);
      } else {
        setUsername(profile.username ?? "");
        setDisplayName(profile.display_name ?? "");
        setBio(profile.bio ?? "");
      }

      setProfileLoading(false);
    }

    loadProfile();
  }, []);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
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

      const { data: { user }, error: userError } =
        await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("Please log in before editing your profile.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: cleanUsername,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        setMessage(
          error.code === "23505"
            ? "That username is already taken."
            : error.message
        );
        return;
      }

      setUsername(cleanUsername);
      setMessage("Profile updated successfully!");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Loading your profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Edit your profile</h1>

        <p className="mt-2 text-zinc-400">
          Customize how people see you on DekuLink.
        </p>

        <form onSubmit={handleUpdate} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={24}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Biography</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 p-3 outline-none"
              placeholder="Tell people a little about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 p-3 font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save profile"}
          </button>

          {message && (
            <p className="text-sm text-purple-300">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}
