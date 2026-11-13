
"use client";

import { useEffect, useMemo, useState } from "react";
import { profiles } from "./data/profiles";
import Link from "next/link";

   const conversations = [
  { name: "Michelle", initials: "MK", color: "blue", preview: "Hey! How was your day?", time: "2m", unread: true },
  { name: "Brian", initials: "BM", color: "purple", preview: "We should catch up sometime.", time: "1h", unread: false },
  { name: "Sharon", initials: "SW", color: "pink", preview: "Haha, that's actually funny 😂", time: "3h", unread: false },
];

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
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" />,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></>,
    confessions: <><path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11z" /><path d="M9 11h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13z" />,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="2.5" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
  };

  return <svg {...common}>{paths[name] ?? null}</svg>;
}

function Avatar({ initials, color, online = false, size = "normal" }: {
  initials: string; color: string; online?: boolean; size?: "small" | "normal" | "large";
}) {
  return (
    <div className={`avatar avatar-${color} avatar-${size}`}>
      {initials}
      {online && <span className="online-indicator" />}
    </div>
  );
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [activeNav, setActiveNav] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [dmTab, setDmTab] = useState("Messages");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<number[]>([]);

  const filteredProfiles = useMemo(
    () => profiles.filter((p) =>
      `${p.name} ${p.username} ${p.bio} ${p.interests.join(" ")}`
        .toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

const [myProfile, setMyProfile] = useState<{
  name: string;
  username: string;
  bio: string;
  interests: string[];
  photo: string;
} | null>(null);

useEffect(() => {
  try {
    const saved = localStorage.getItem("dekulink-editable-profile");

    if (saved) {
      setMyProfile(JSON.parse(saved));
    }
  } catch (error) {
    console.error("Could not load account profile:", error);
  }
}, []);

  const toggleLike = (id: number) => {
    setLiked((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);
  };

  return (
    <main className={`app-shell ${dark ? "dark" : "light"}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => setActiveNav("Home")}>
            <span className="brand-symbol">D</span>
            <span>Deku<span className="brand-blue">Link</span></span>
          </button>

          <div className="header-actions">
            <button className="icon-button" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>
              <Icon name="search" />
           </button>
<button
  className="profile-trigger"
  onClick={() => setMenuOpen(!menuOpen)}
>
  {myProfile?.photo ? (
    <img
      src={myProfile.photo}
      alt={myProfile.name}
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  ) : (
    <Avatar
      initials={
        myProfile?.name
          ?.trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase() || "AG"
      }
      color="blue"
      size="small"
    />
  )}

  <span className="profile-trigger-name">
    {myProfile?.name || "My profile"}
  </span>

  <Icon name="menu" />
</button>

          </div>

          {menuOpen && (
            <>
              <button className="menu-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
              <div className="dropdown-menu">
     
<div className="dropdown-user">
  {myProfile?.photo ? (
    <img
      src={myProfile.photo}
      alt={`${myProfile.name}'s profile`}
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  ) : (
    <Avatar
      initials={
        myProfile?.name
          ?.trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase() || "AG"
      }
      color="blue"
    />
  )}

  <div>
    <strong>{myProfile?.name || "Your profile"}</strong>
    <span>{myProfile?.username || "@yourusername"}</span>
  </div>
</div>

                <button
  onClick={() => {
    setMenuOpen(false);
    window.location.href = "/edit-profile";
  }}
>
  <Icon name="users" size={18} />
  Edit Profile
</button>
                <button onClick={() => setDark(!dark)}>
                  <Icon name={dark ? "sun" : "moon"} size={18} />
                  {dark ? "Switch to light mode" : "Switch to dark mode"}
                </button>
                <button onClick={() => { setMenuOpen(false); alert("Support page will be connected in a future milestone."); }}>
                  <Icon name="message" size={18} /> Support
                </button>
                <button onClick={() => { setMenuOpen(false); alert("Settings will be built in a future milestone."); }}>
                  <Icon name="settings" size={18} /> Settings
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="main-container">
        {searchOpen && (
          <div className="search-panel">
            <Icon name="search" />
            <input autoFocus placeholder="Search people and interests..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={() => { setSearch(""); setSearchOpen(false); }}><Icon name="close" /></button>
          </div>
        )}

            {activeNav === "Home" ? (
          <div className="content-layout">
            <section className="feed-column">
              <div className="welcome-section">
                <div>
                  <span className="eyebrow"><span className="live-dot" /> YOUR SOCIAL SPACE</span>
                  <h1>Find your <span>people.</span></h1>
                  <p>Discover connections, share moments and make something meaningful.</p>
                </div>
                <div className="welcome-decoration"><Icon name="heart" size={42} /></div>
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <div><span className="eyebrow">GOOD TO SEE YOU</span><h2>Recently active</h2></div>
                  <button className="text-link" onClick={() => setSearchOpen(true)}>See all <Icon name="arrow" size={15} /></button>
                </div>
                <div className="active-strip">
                  {profiles.filter((p) => p.online).map((profile) => (
                    <button className="active-person" key={profile.id} onClick={() => setSearchOpen(true)}>
                      <Avatar initials={profile.initials} color={profile.color} online size="large" />
                      <span>{profile.name}</span>
                    </button>
                  ))}
                  <button className="active-person">
                    <div className="avatar avatar-more avatar-large"><Icon name="plus" /></div>
                    <span>Discover</span>
                  </button>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div><span className="eyebrow">HANDPICKED FOR YOU</span><h2>People to discover</h2></div>
                  <span className="result-count">{filteredProfiles.length} people</span>
                </div>
                <div className="profile-grid">
                  {filteredProfiles.map((profile) => (
                    <article className="profile-card" key={profile.id}>
                      <div className={`card-cover cover-${profile.color}`}>
                        <span className="cover-label">DEKULINK MEMBER</span>
                        <button className={`like-button ${liked.includes(profile.id) ? "liked" : ""}`} onClick={() => toggleLike(profile.id)} aria-label="Express interest">
                          <Icon name="heart" size={18} />
                        </button>

<div className="profile-photo-wrapper">
  {profile.photo ? (
    <img
      src={profile.photo}
      alt={`${profile.name}'s profile`}
      className="profile-photo"
    />
  ) : (
    <Avatar
      initials={profile.initials}
      color={profile.color}
      online={profile.online}
      size="large"
    />
  )}

  {profile.photo && profile.online && (
    <span className="online-indicator" />
  )}
</div>
                      </div>
                      <div className="profile-card-body">
                        <div className="profile-name-row">
                          <div><h3>{profile.name}</h3><span>{profile.username}</span></div>
                          {profile.online && <span className="online-label">Active</span>}
                        </div>
                        <p className="profile-bio">{profile.bio}</p>
                        <div className="interest-tags">
                          {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
                        </div>
           
<Link
  href={`/profile/${encodeURIComponent(profile.username.replace(/^@/, ""))}`}
  className="connect-button"
>
  View profile <Icon name="arrow" size={15} />
</Link>

                      </div>
                    </article>
                  ))}
                  {filteredProfiles.length === 0 && <div className="empty-state">No profiles match your search yet.</div>}
                </div>
              </section>

              <section className="discovery-banner">
                <div className="banner-icon"><Icon name="location" size={23} /></div>
                <div><strong>Your world, a little closer.</strong><p>Discover people around you when you're ready.</p></div>
                <button onClick={() => { setDmOpen(true); setDmTab("Around You"); }}>Explore <Icon name="arrow" size={15} /></button>
              </section>
            </section>

            <aside className="side-column">
              <div className="side-card">
                <span className="eyebrow">YOUR COMMUNITY</span>
                <h3>Good connections start here.</h3>
                <p>Be curious. Be kind. Find people who make your world bigger.</p>
                <div className="community-stats">
                  <div><strong>Discover</strong><span>New people</span></div>
                  <div><strong>Connect</strong><span>Meaningful moments</span></div>
                </div>
              </div>
              <div className="side-card side-note">
                <div className="note-icon"><Icon name="heart" /></div>
                <strong>A little reminder</strong>
                <p>Your next favourite person could be one hello away.</p>
              </div>
              <div className="footer-note">DEKULINK · FIND YOUR PEOPLE</div>
            </aside>
          </div>
        ) : (
          <div className="coming-soon">
            <div className="coming-icon"><Icon name={activeNav === "Confessions" ? "confessions" : "heart"} size={32} /></div>
            <span className="eyebrow">COMING UP NEXT</span>
            <h1>{activeNav}</h1>
            <p>This section is reserved for the next DekuLink development milestone.</p>
            <button className="primary-button" onClick={() => setActiveNav("Home")}>Back to home</button>
          </div>
        )}
      </div>

        {dmOpen && (
        <div className="modal-backdrop" onClick={() => setDmOpen(false)}>
          <section className="dm-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dm-header">
              <div><span className="eyebrow">YOUR CONNECTIONS</span><h2>Messages</h2></div>
              <button className="icon-button" onClick={() => setDmOpen(false)}><Icon name="close" /></button>
            </div>
            <div className="dm-tabs">
              {["Messages", "Requests", "Around You"].map((tab) => (
                <button key={tab} className={dmTab === tab ? "selected" : ""} onClick={() => setDmTab(tab)}>{tab}</button>
              ))}
            </div>
            {dmTab === "Messages" && (
              <div className="conversation-list">
                {conversations.map((chat) => (
                  <button className="conversation" key={chat.name} onClick={() => alert("Conversation screens will be connected in a future milestone.")}>
                    <Avatar initials={chat.initials} color={chat.color} />
                    <div className="conversation-copy"><strong>{chat.name}</strong><span>{chat.preview}</span></div>
                    <div className="conversation-meta"><span>{chat.time}</span>{chat.unread && <i />}</div>
                  </button>
                ))}
              </div>
            )}
            {dmTab === "Requests" && (
              <div className="dm-empty"><Icon name="message" size={28} /><strong>No message requests</strong><span>New requests will appear here.</span></div>
            )}
            {dmTab === "Around You" && (
              <div className="dm-empty"><Icon name="location" size={28} /><strong>Discover people nearby</strong><span>Around You will be opt-in. Location permission and proximity controls will be added with the backend integration.</span><span className="privacy-note">Your exact location will never be shown to other users.</span></div>
            )}
            <div className="dm-footer">Private conversations. Your privacy matters.</div>
          </section>
        </div>
      )}

      
<nav className="mobile-footer" aria-label="Main dashboard navigation">
  <button
    className={activeNav === "Home" ? "active" : ""}
    onClick={() => setActiveNav("Home")}
  >
    <Icon name="home" size={20} />
    <span>Home</span>
  </button>

  <button onClick={() => setSearchOpen(true)}>
    <Icon name="search" size={20} />
    <span>Discover</span>
  </button>

  <button
    className={activeNav === "Confessions" ? "active" : ""}
    onClick={() => setActiveNav("Confessions")}
  >
    <Icon name="confessions" size={20} />
    <span>Confessions</span>
  </button>

  <button
    className={activeNav === "SneakLinks" ? "active" : ""}
    onClick={() => setActiveNav("SneakLinks")}
  >
    <Icon name="heart" size={20} />
    <span>SneakLinks</span>
  </button>

  <button
    onClick={() => setDmOpen(true)}
  >
    <Icon name="message" size={20} />
    <span>Messages</span>
  </button>
</nav>

    </main>
    <HomeClient
      username={username}
      displayName={displayName}
      avatarUrl={avatarUrl}
      isAuthenticated={Boolean(user)}
    />
  );
}
