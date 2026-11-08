import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">DekuLink</h1>

      {error ? (
        <p className="mt-4 text-red-500">
          Supabase connection failed: {error.message}
        </p>
      ) : (
        <p className="mt-4 text-green-600">
          Supabase connection successful!
        </p>
      )}

      <p className="mt-2">
        {data?.claims ? "Authenticated user detected." : "No user signed in yet."}
      </p>
    </main>
  );
}