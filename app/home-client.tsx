
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  estate: string | null;
  hostel_name: string | null;
  interests: string[] | null;
};

type Conversation = {
  conversation_id: string;
  other_user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
};

type HomeProps = {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAuthenticated: boolean;
};

const colors = ["blue", "purple", "pink", "green"];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" />,
    message: <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13z" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
  };

  return <svg {...common}>{paths[name] ?? null}</svg>;
}

function Avatar({
  initials,
  color = "blue",
  size = "normal",
  photo,
}: {
  initials: string;
  color?: string;
  size?: "small" | "normal" | "large";
  photo?: string | null;
}) {
  return (
    <div className={`avatar avatar-${color} avatar-${size}`}>
      {photo ? (
        <img
          src={photo}
          alt="Profile"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

function initialsFrom(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "D";
}

function timeAgo(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default function Home({
  username,
  displayName,
  avatarUrl,
  isAuthenticated,
}: HomeProps) {
  const router = useRouter();
  const supabase = createClient();

  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState("");

  const profileLabel = displayName?.trim() || `@${username}`;
  const profileInitials = initialsFrom(displayName?.trim() || username || "D");

  const loadStudents = useCallback(async (query = "") => {
    setLoadingStudents(true);
    setError("");

    const { data, error: rpcError } = await supabase.rpc(
      "search_dekulink_students",
      {
        search_query: query.trim() || null,
        hostel_filter: null,
        estate_filter: null,
        interest_filter: null,
      }
    );

    if (rpcError) {
      setError(rpcError.message);
      setStudents([]);
    } else {
      setStudents((data ?? []) as Student[]);
    }

    setLoadingStudents(false);
  }, [supabase]);

  const loadConversations = useCallback(async () => {
    setLoadingMessages(true);

    const { data, error: rpcError } = await supabase.rpc("get_direct_inbox");

    if (rpcError) {
      console.error("Could not load direct inbox:", rpcError.message);
      setConversations([]);
    } else {
      setConversations((data ?? []) as Conversation[]);
    }

    setLoadingMessages(false);
  }, [supabase]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingStudents(false);
      setLoadingMessages(false);
      return;
    }

    void loadStudents();
    void loadConversations();
  }, [isAuthenticated, loadStudents, loadConversations]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const timeout = window.setTimeout(() => {
      void loadStudents(search);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search, isAuthenticated, loadStudents]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setMenuOpen(false);
    router.replace("/login");
    router.refresh();
  }

  function openProfile(id: string) {
    router.push(`/profile/${id}`);
  }

  function openConversation(id: string) {
    router.push(`/messages/direct/${id}`);
  }

  return (
    <main className={`app-shell ${dark ? "dark" : "light"}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => router.push("/")}>
            <span className="brand-symbol">D</span>
            <span>Deku<span className="brand-blue">Link</span></span>
          </button>

          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search students"
              onClick={() => router.push("/discover")}
            >
              <Icon name="search" />
            </button>

            <button
              className="profile-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Avatar
                initials={profileInitials}
                color="blue"
                size="small"
                photo={avatarUrl}
              />
              <span className="profile-trigger-name">
                {displayName?.trim() || "My profile"}
              </span>
              <Icon name="menu" />
            </button>
          </div>

          {menuOpen && (
            <>
              <button
                className="menu-backdrop"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />

              <div className="dropdown-menu">
                <div className="dropdown-user">
                  <Avatar initials={profileInitials} photo={avatarUrl} />
                  <div>
                    <strong>{profileLabel}</strong>
                    <span>@{username}</span>
                  </div>
                </div>

                <button onClick={() => {
                  setMenuOpen(false);
                  router.push("/profile/edit");
                }}>
                  <Icon name="home" size={18} />
                  My profile
                </button>

                <button onClick={() => setDark(!dark)}>
                  <Icon name={dark ? "sun" : "moon"} size={18} />
                  {dark ? "Switch to light mode" : "Switch to dark mode"}
                </button>

                <button onClick={() => {
                  setMenuOpen(false);
                  router.push("/messages");
                }}>
                  <Icon name="message" size={18} />
                  Messages
                </button>

                {isAuthenticated ? (
                  <button onClick={handleLogout}>
                    <Icon name="arrow" size={18} />
                    Log out
                  </button>
                ) : (
                  <>
                    <button onClick={() => router.push("/login")}>Log in</button>
                    <button onClick={() => router.push("/register")}>Create account</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="main-container">
        <div className="content-layout">
          <section className="feed-column">
            <div className="welcome-section">
              <div>
                <span className="eyebrow">
                  <span className="live-dot" /> YOUR SOCIAL SPACE
                </span>
                <h1>
                  Find your <span>people.</span>
                </h1>
                <p>
                  Discover real students, connect and make your campus feel
                  smaller.
                </p>
              </div>
              <div className="welcome-decoration">
                <Icon name="heart" size={42} />
              </div>
            </div>

            <section className="section-block">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR CAMPUS COMMUNITY</span>
                  <h2>Students on DekuLink</h2>
                </div>
                <span className="result-count">
                  {loadingStudents ? "Loading..." : `${students.length} students`}
                </span>
              </div>

              <div className="search-panel">
                <Icon name="search" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students by name, username or interests..."
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Clear search">
                    <Icon name="close" />
                  </button>
                )}
              </div>

              {error && (
                <div className="empty-state">
                  We couldn't load students: {error}
                </div>
              )}

              <div className="profile-grid">
                {students.map((student, index) => {
                  const name = student.display_name || student.username;
                  const color = colors[index % colors.length];

                  return (
                    <article className="profile-card" key={student.id}>
                      <div className={`card-cover cover-${color}`}>
                        <span className="cover-label">DEKULINK MEMBER</span>
                        <div className="profile-photo-wrapper">
                          <Avatar
                            initials={initialsFrom(name)}
                            color={color}
                            size="large"
                            photo={student.avatar_url}
                          />
                        </div>
                      </div>

                      <div className="profile-card-body">
                        <div className="profile-name-row">
                          <div>
                            <h3>{name}</h3>
                            <span>@{student.username}</span>
                          </div>
                        </div>

                        <p className="profile-bio">
                          {student.bio || "A member of the DekuLink community."}
                        </p>

                        {(student.hostel_name || student.estate) && (
                          <p className="profile-bio">
                            {[
                              student.hostel_name,
                              student.estate,
                            ].filter(Boolean).join(" · ")}
                          </p>
                        )}

                        <div className="interest-tags">
                          {(student.interests ?? []).slice(0, 4).map((interest) => (
                            <span key={interest}>{interest}</span>
                          ))}
                        </div>

                        <button
                          className="connect-button"
                          onClick={() => openProfile(student.id)}
                        >
                          View profile <Icon name="arrow" size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })}

                {!loadingStudents && !error && students.length === 0 && (
                  <div className="empty-state">
                    {search
                      ? "No students match that search."
                      : "No other students have joined yet. Invite your friends to create accounts and they'll appear here."}
                  </div>
                )}

                {loadingStudents && (
                  <div className="empty-state">Loading real DekuLink members...</div>
                )}
              </div>
            </section>

            <section className="discovery-banner">
              <div className="banner-icon">
                <Icon name="location" size={23} />
              </div>
              <div>
                <strong>Know someone at DeKUT?</strong>
                <p>Invite your friends and grow the DekuLink community.</p>
              </div>
              <button onClick={() => router.push("/discover")}>
                Discover <Icon name="arrow" size={15} />
              </button>
            </section>
          </section>

          <aside className="side-column">
            <div className="side-card">
              <span className="eyebrow">YOUR COMMUNITY</span>
              <h3>Good connections start here.</h3>
              <p>
                DekuLink works best when your friends join. Find classmates,
                meet people and start conversations.
              </p>
              <div className="community-stats">
                <div>
                  <strong>{students.length}</strong>
                  <span>Students found</span>
                </div>
                <div>
                  <strong>{conversations.length}</strong>
                  <span>Conversations</span>
                </div>
              </div>
            </div>

            <div className="side-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">YOUR INBOX</span>
                  <h2>Recent messages</h2>
                </div>
                <button className="text-link" onClick={() => router.push("/messages")}>
                  See all <Icon name="arrow" size={15} />
                </button>
              </div>

              {loadingMessages ? (
                <p>Loading conversations...</p>
              ) : conversations.length > 0 ? (
                <div className="conversation-list">
                  {conversations.slice(0, 5).map((chat) => {
                    const name = chat.display_name || chat.username;

                    return (
                      <button
                        className="conversation"
                        key={chat.conversation_id}
                        onClick={() => openConversation(chat.conversation_id)}
                      >
                        <Avatar
                          initials={initialsFrom(name)}
                          photo={chat.avatar_url}
                        />
                        <div className="conversation-copy">
                          <strong>{name}</strong>
                          <span>{chat.last_message_preview || "Start chatting"}</span>
                        </div>
                        <div className="conversation-meta">
                          <span>{timeAgo(chat.last_message_at)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="dm-empty">
                  <Icon name="message" size={28} />
                  <strong>No conversations yet</strong>
                  <span>Visit a student's profile and send the first message.</span>
                </div>
              )}

              <button
                className="connect-button"
                style={{ marginTop: 14 }}
                onClick={() => router.push("/messages")}
              >
                Open inbox <Icon name="arrow" size={15} />
              </button>
            </div>

            <div className="side-card side-note">
              <div className="note-icon">
                <Icon name="heart" />
              </div>
              <strong>A little reminder</strong>
              <p>Your next favourite person could be one hello away.</p>
            </div>

            <div className="footer-note">
              DEKULINK · FIND YOUR PEOPLE
            </div>
          </aside>
        </div>
      </div>

      <nav className="mobile-footer" aria-label="Main dashboard navigation">
        <button className="active" onClick={() => router.push("/")}>
          <Icon name="home" size={20} />
          <span>Home</span>
        </button>

        <button onClick={() => router.push("/discover")}>
          <Icon name="search" size={20} />
          <span>Discover</span>
        </button>

        <button onClick={() => router.push("/sneaklinks")}>
          <Icon name="heart" size={20} />
          <span>SneakLinks</span>
        </button>

        <button onClick={() => router.push("/messages")}>
          <Icon name="message" size={20} />
          <span>Messages</span>
        </button>

        <button onClick={() => router.push("/profile/edit")}>
          <Icon name="home" size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </main>
  );
}
