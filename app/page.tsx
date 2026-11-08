
import { createClient } from "@/lib/supabase/server";
import HomeClient from "./home-client";

export const instant = false;

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username = "guest";
  let displayName: string | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (profile) {
      username = profile.username;
      displayName = profile.display_name;
      avatarUrl = profile.avatar_url;
    }
  }

  return (
    <HomeClient
      username={username}
      displayName={displayName}
      avatarUrl={avatarUrl}
      isAuthenticated={Boolean(user)}
    />
  );
}
