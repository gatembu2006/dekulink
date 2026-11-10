
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  estate: string | null;
  hostel_name: string | null;
  interests: string[] | null;
};

export default function EditProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [estate, setEstate] = useState("");
  const [hostel, setHostel] = useState("");
  const [interests, setInterests] = useState("");

  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const supabase = createClient();

      try {
        const timeout = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                "Supabase took too long to respond. Please refresh and try again."
              )
            );
          }, 15000);
        });

        const load = async (): Promise<Profile | null> => {
          const { data: authData, error: authError } =
            await supabase.auth.getUser();

          if (authError) throw authError;

          if (!authData.user) {
            router.replace("/login");
            return null;
          }

          const { data, error: profileError } = await supabase
            .from("profiles")
            .select(
              "id, username, display_name, avatar_url, bio, estate, hostel_name, interests"
            )
            .eq("id", authData.user.id)
            .single();

          if (profileError) throw profileError;

          return data as Profile;
        };

        const student = await Promise.race([load(), timeout]);

        if (!active) return;

        if (student) {
          setProfile(student);
          setUsername(student.username || "");
          setDisplayName(student.display_name || "");
          setBio(student.bio || "");
          setEstate(student.estate || "");
          setHostel(student.hostel_name || "");
          setInterests((student.interests || []).join(", "));
          setPreview(student.avatar_url || "");
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your image must be smaller than 5 MB.");
      return;
    }

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
    setError("");
    setSuccess("");
  }

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!profile || saving) return;

    const cleanUsername = username.trim().replace(/^@/, "");

    if (!displayName.trim() || !cleanUsername) {
      setError("Display name and username are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    try {
      let avatarUrl = profile.avatar_url;

      if (avatar) {
        const extension =
          avatar.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${profile.id}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatar, {
            upsert: true,
            contentType: avatar.type,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        avatarUrl = data.publicUrl;
      }

      const updatedProfile = {
        username: cleanUsername,
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        estate: estate.trim() || null,
        hostel_name: hostel.trim() || null,
        interests: interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile({
        ...profile,
        ...updatedProfile,
      });

      setAvatar(null);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] text-[#A9BED8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#29496C] border-t-[#168BFF]" />
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071426] px-6 text-center text-white">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold">
            Unable to load your profile
          </h1>

          <p className="mt-3 text-sm text-red-400">
            {error || "No profile information was returned."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#168BFF] px-6 py-3 font-semibold"
          >
            Try again
          </button>

          <button
            onClick={() => router.push("/home")}
            className="ml-3 mt-6 text-sm text-[#A9BED8]"
          >
            Go home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071426] px-4 py-8 pb-24 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-7 text-sm text-[#A9BED8] transition hover:text-white"
        >
          ← Back
        </button>

        <div className="mb-8">
          <p className="text-sm font-bold tracking-widest text-[#168BFF]">
            DEKULINK
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Edit your profile
          </h1>

          <p className="mt-2 text-sm text-[#91A9C5]">
            Make your campus identity yours.
          </p>
        </div>

        <form
          onSubmit={saveProfile}
          className="space-y-7 rounded-3xl border border-[#1D3A5D] bg-[#10243D] p-5 sm:p-8"
        >
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Profile picture preview"
                className="h-28 w-28 rounded-full border-2 border-[#168BFF] object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#168BFF] text-4xl font-bold">
                {(displayName || username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <label className="mt-4 cursor-pointer rounded-xl border border-[#29496C] px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-[#09182B]">
              Change profile picture

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>

            <p className="mt-2 text-xs text-[#91A9C5]">
              Maximum image size: 5 MB
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Display name
              </label>

              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-[#29496C] bg-[#09182B] px-4 py-3 text-sm outline-none focus:border-[#168BFF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Username
              </label>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                required
                placeholder="yourusername"
                className="w-full rounded-xl border border-[#29496C] bg-[#09182B] px-4 py-3 text-sm outline-none focus:border-[#168BFF]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={4}
              placeholder="Tell other students about yourself..."
              className="w-full resize-none rounded-xl border border-[#29496C] bg-[#09182B] px-4 py-3 text-sm outline-none focus:border-[#168BFF]"
            />

            <p className="mt-1 text-right text-xs text-[#91A9C5]">
              {bio.length}/300
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Hostel name
              </label>

              <input
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                maxLength={100}
                placeholder="Your hostel"
                className="w-full rounded-xl border border-[#29496C] bg-[#09182B] px-4 py-3 text-sm outline-none focus:border-[#168BFF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Residence / Estate
              </label>

              <input
                value={estate}
                onChange={(e) => setEstate(e.target.value)}
                maxLength={100}
                placeholder="e.g. Nyeri Town"
                className="w-full rounded-xl border border-[#29496C] bg-[#09182B] px-4 py-3 text-sm outline-none focus:border-[#168BFF]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Interests
            </label>

            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Gaming, football, music, engineering..."
              className="w-full rounded-xl border border-[#29496C] bg-[#09182B] px-4 py-3 text-sm outline-none focus:border-[#168BFF]"
            />

            <p className="mt-2 text-xs text-[#91A9C5]">
              Separate interests using commas.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#168BFF] py-4 font-bold text-white transition hover:bg-[#0066E6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving changes..." : "Save profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
