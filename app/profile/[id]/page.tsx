
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  estate: string | null;
  hostel_name: string | null;
  interests: string[] | null;
};

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "get_dekulink_student_profile",
        { target_user_id: id }
      );

      if (error) {
        setError("We couldn't load this profile.");
      } else if (!data || data.length === 0) {
        setError("This student profile could not be found.");
      } else {
        setStudent(data[0] as Student);
      }

      setLoading(false);
    }

    if (id) loadProfile();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        Loading profile...
      </main>
    );
  }

  if (error || !student) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <h1 className="text-xl font-bold">Profile unavailable</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {error || "Something went wrong."}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black"
        >
          Go back
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white">
      <div className="mx-auto max-w-xl">

        <button
          onClick={() => router.back()}
          className="mb-8 text-sm text-zinc-400 hover:text-white"
        >
          ← Back
        </button>

        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">

          <div className="flex flex-col items-center text-center">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt=""
                className="h-28 w-28 rounded-full border-2 border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 text-4xl font-bold">
                {(student.display_name || student.username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <h1 className="mt-5 text-2xl font-bold">
              {student.display_name || "DekuLink Student"}
            </h1>

            <p className="mt-1 text-sm text-indigo-400">
              @{student.username || "student"}
            </p>

            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
              {student.bio || "No bio added yet."}
            </p>
          </div>

          <div className="my-7 border-t border-white/10" />

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Hostel
              </p>
              <p className="mt-1 text-sm">
                {student.hostel_name || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Residence / Estate
              </p>
              <p className="mt-1 text-sm">
                {student.estate || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Interests
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {student.interests?.length ? (
                  student.interests.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full bg-indigo-500/10 px-3 py-2 text-xs text-indigo-300"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">
                    No interests added yet.
                  </span>
                )}
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
