
"use client";

import { useEffect, useState } from "react";
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

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setStudents([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);

      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "search_dekulink_students",
        {
          search_query: query,
          hostel_filter: null,
          estate_filter: null,
          interest_filter: null,
        }
      );

      if (!error) {
        setStudents((data ?? []) as Student[]);
      } else {
        setStudents([]);
      }

      setSearched(true);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto min-h-screen max-w-2xl border-x border-white/10">

        {/* Search header */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/95 px-5 py-5 backdrop-blur-xl">
          <h1 className="mb-5 text-2xl font-bold tracking-tight">
            Search
          </h1>

          <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-4 py-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 text-zinc-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-zinc-400 hover:text-white"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        {/* Search content */}
        <section className="px-5 py-6">

          {!search.trim() && (
            <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/20">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>

              <h2 className="text-lg font-semibold">
                Find your people
              </h2>

              <p className="mt-2 max-w-xs text-sm text-zinc-500">
                Discover students, meet people from your hostel
                and find others who share your interests.
              </p>
            </div>
          )}

          {loading && (
            <p className="py-12 text-center text-sm text-zinc-500">
              Searching students...
            </p>
          )}

          {!loading && searched && students.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-lg font-semibold">
                No results found
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Try searching another name or username.
              </p>
            </div>
          )}

          {!loading && students.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">Students</h2>
                <span className="text-xs text-zinc-500">
                  {students.length} results
                </span>
              </div>

              <div className="space-y-5">
                {students.map((student) => (
                  <article
                    key={student.id}
                    className="flex items-center gap-4"
                  >
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 text-xl font-bold">
                        {(student.display_name || student.username || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {student.username || "student"}
                      </p>

                      <p className="truncate text-sm text-zinc-400">
                        {student.display_name || "DekuLink Student"}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {[student.hostel_name, student.estate]
                          .filter(Boolean)
                          .join(" · ") ||
                          student.bio ||
                          "DekuLink student"}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        window.location.assign(
                          `/profile/${student.id}`
                        )
                      }
                      className="shrink-0 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
                    >
                      View
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
