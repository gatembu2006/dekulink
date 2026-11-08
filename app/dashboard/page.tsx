
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login-test");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Welcome to DekuLink</h1>

        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Your account</h2>

          <p className="mt-4 text-zinc-400">
            Email: {user.email}
          </p>

          <p className="mt-2 text-zinc-400">
            Username: @{profile?.username ?? "Profile not found"}
          </p>

          <p className="mt-2 text-zinc-400">
            Display name: {profile?.display_name ?? "Not set"}
          </p>
        </div>
      </div>
    </main>
  );
}
