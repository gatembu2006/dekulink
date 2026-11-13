
"use client";

import { Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { profiles } from "../../data/profiles";
import type { Moment } from "../../data/profiles";

type IconName =
  | "back"
  | "search"
  | "menu"
  | "heart"
  | "message"
  | "sparkles"
  | "image"
  | "map"
  | "home"
  | "users"
  | "confessions";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const paths: Record<IconName, ReactNode> = {
    back: <path d="m15 18-6-6 6-6M9 12h12" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" />
    ),
    message: (
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
    ),
    sparkles: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
        <path d="m19 15 1.2 2.8L23 19l-2.8 1.2L19 23l-1.2-2.8L15 19l2.8-1.2L19 15z" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
        <path d="M9 3v15m6-12v15" />
      </>
    ),
    home: (
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    confessions: (
      <>
        <path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11z" />
        <path d="M9 11h6" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

/* MAIN PROFILE CONTENT */

function MemberProfileContent() {
  const params = useParams<{ username: string }>();

  const [sneaklinkSent, setSneaklinkSent] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
const [savedProfile, setSavedProfile] = useState<{
  name: string;
  username: string;
  bio: string;
  interests: string[];
  photo: string;
} | null>(null);

const [profileDataReady, setProfileDataReady] = useState(false);

useEffect(() => {
  try {
    const saved = localStorage.getItem("dekulink-editable-profile");

    if (saved) {
      setSavedProfile(JSON.parse(saved));
    }
  } catch (error) {
    console.error("Could not load saved profile:", error);
  } finally {
    setProfileDataReady(true);
  }
}, []);
  const username = params.username ?? "";

  
const baseProfile = profiles.find(
  (item) =>
    item.username.replace(/^@/, "").toLowerCase() ===
    username.toLowerCase()
);

const isSavedProfile =
  savedProfile !== null &&
  savedProfile.username.replace(/^@/, "").toLowerCase() ===
    username.toLowerCase();

const profile =
  isSavedProfile && savedProfile
    ? {
        ...(baseProfile ?? {
          id: 0,
          name: savedProfile.name,
          username: savedProfile.username,
          bio: savedProfile.bio,
          initials: "AG",
          color: "blue",
          online: true,
          interests: [],
          moments: [],
        }),
        name: savedProfile.name,
        username: savedProfile.username,
        bio: savedProfile.bio,
        initials:
          savedProfile.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase() || "AG",
        interests: savedProfile.interests,
        photo: savedProfile.photo || undefined,
      }
    : baseProfile;

  if (!profile) {
    return (
      <main className="member-page">
        <div className="member-not-found">
          <Icon name="users" size={42} />
          <h1>Profile not found</h1>
          <p>We couldn't find this DekuLink member.</p>
          <Link href="/" className="member-back-link">
            Return home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="member-page">

      {/* TOP HEADER */}

      <header className="member-topbar">
        <Link href="/" className="member-brand">
          <span className="member-brand-icon">D</span>
          <span>
            Deku<span>Link</span>
          </span>
        </Link>

        <div className="member-header-actions">
          <Link
            href="/"
            className="member-icon-button"
            aria-label="Back home"
          >
            <Icon name="back" />
          </Link>

          <button
            type="button"
            className="member-icon-button"
            aria-label="Search"
            onClick={() =>
              setNotice("Search will be connected in a future milestone.")
            }
          >
            <Icon name="search" />
          </button>

          <button
            type="button"
            className="member-icon-button"
            aria-label="More options"
            onClick={() =>
              setNotice("Profile options will be available with settings integration.")
            }
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>

      {/* PROFILE CONTAINER */}

      <div className="member-container">

        {/* GRADIENT COVER */}

        <section className="member-cover">
          <div className="member-cover-orb member-orb-one" />
          <div className="member-cover-orb member-orb-two" />

          <div className="member-cover-top">
            <span>DEKULINK MEMBER</span>
            <Icon name="sparkles" size={22} />
          </div>

          <div className="member-cover-caption">
            <span>GET TO KNOW</span>
            <h1>{profile.name}</h1>
          </div>
        </section>

        {/* PROFILE IDENTITY */}

        <section className="member-identity">
          <div className="member-avatar-wrap">
            {profile.photo ? (
              <img
                src={profile.photo}
                alt={`${profile.name}'s profile`}
                className="member-avatar"
              />
            ) : (
              <div
                className={`member-avatar-fallback avatar-${profile.color}`}
              >
                {profile.initials}
              </div>
            )}

            {profile.online && (
              <span className="member-online-dot" />
            )}
          </div>

          <div className="member-identity-copy">
            <div className="member-name-line">
              <div>
                <h2>{profile.name}</h2>
                <p>{profile.username}</p>
              </div>

              <span
                className={
                  profile.online
                    ? "member-status online"
                    : "member-status"
                }
              >
                <i />
                {profile.online ? "Online now" : "Offline"}
              </span>
            </div>

            <p className="member-bio">{profile.bio}</p>

            {/* PROFILE ACTIONS */}

            <div className="member-actions">
              <button
                type="button"
                className={`member-sneaklink-button ${
                  sneaklinkSent ? "sent" : ""
                }`}
                onClick={() => {
                  const nextState = !sneaklinkSent;

                  setSneaklinkSent(nextState);

                  setNotice(
                    nextState
                      ? "SneakLink preview selected. Backend connection is coming next."
                      : "SneakLink preview cancelled."
                  );
                }}
              >
                <Icon name="heart" size={18} />
                {sneaklinkSent ? "Interest selected" : "SneakLink"}
              </button>

              <button
                type="button"
                className="member-message-button"
                onClick={() =>
                  setNotice(
                    "Messaging will be connected when the backend integration is ready."
                  )
                }
              >
                <Icon name="message" size={18} />
                Message
              </button>
            </div>
          </div>
        </section>

        {/* NOTIFICATIONS */}

        {notice && (
          <div className="member-notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              ×
            </button>
          </div>
        )}

        {/* PROFILE CONTENT */}

        <div className="member-content-grid">

          {/* MAIN COLUMN */}

          <div className="member-main-column">

            {/* ABOUT */}

            <section className="member-panel about-panel">
              <div className="member-panel-heading">
                <div>
                  <span className="member-eyebrow">
                    A LITTLE INTRODUCTION
                  </span>
                  <h3>About {profile.name}</h3>
                </div>

                <span className="member-panel-icon">
                  <Icon name="sparkles" />
                </span>
              </div>

              <p className="member-about-text">
                {profile.bio}
              </p>

              <div className="member-about-footer">
                <span>
                  <Icon name="users" size={15} />
                  DekuLink community member
                </span>

                <span>
                  <Icon name="map" size={15} />
                  Personal details shared by member
                </span>
              </div>
            </section>

            {/* INTERESTS */}

            <section className="member-panel interests-panel">
              <div className="member-panel-heading">
                <div>
                  <span className="member-eyebrow">
                    THINGS THAT MAKE THEM, THEM
                  </span>
                  <h3>Interests & hobbies</h3>
                </div>

                <span className="member-interest-count">
                  {profile.interests.length} interests
                </span>
              </div>

              <div className="member-interest-list">
                {profile.interests.map((interest) => (
                  <span
                    className="member-interest-tag"
                    key={interest}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </section>

            {/* MOMENTS GALLERY */}

            <section className="member-panel moments-panel">
              <div className="member-panel-heading">
                <div>
                  <span className="member-eyebrow">
                    LIFE IN LITTLE MOMENTS
                  </span>
                  <h3>Recent moments</h3>
                </div>

                <span className="member-panel-icon">
                  <Icon name="image" />
                </span>
              </div>

              {profile.moments && profile.moments.length > 0 ? (
                <div className="member-moments-grid">
                  {profile.moments.map((moment) => (
                    <button
                      type="button"
                      className="member-moment-card"
                      key={moment.id}
                      onClick={() => setSelectedMoment(moment)}
                    >
                      <img
                        src={moment.image}
                        alt={moment.caption}
                        loading="lazy"
                      />

                      <span className="member-moment-overlay">
                        <strong>{moment.caption}</strong>
                        <small>{moment.time}</small>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="member-moments-empty">
                  <div className="member-moments-symbol">
                    <Icon name="image" size={30} />
                  </div>

                  <h4>No moments shared yet</h4>

                  <p>
                    Photos and updates shared by {profile.name} will
                    appear here.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR */}

          <aside className="member-side-column">

            <section className="member-panel member-glance-panel">
              <span className="member-eyebrow">
                PROFILE SNAPSHOT
              </span>

              <h3>At a glance</h3>

              <div className="member-glance-row">
                <span>Member</span>
                <strong>{profile.name}</strong>
              </div>

              <div className="member-glance-row">
                <span>Username</span>
                <strong>{profile.username}</strong>
              </div>

              <div className="member-glance-row">
                <span>Availability</span>
                <strong className={profile.online ? "glance-online" : ""}>
                  {profile.online ? "Online" : "Offline"}
                </strong>
              </div>

              <div className="member-glance-row">
                <span>Interests</span>
                <strong>{profile.interests.length}</strong>
              </div>
            </section>

            <section className="member-panel member-reminder-panel">
              <span className="member-reminder-icon">
                <Icon name="heart" size={23} />
              </span>

              <h3>
                Good connections start with a hello.
              </h3>

              <p>
                Discover what you have in common and start building
                a meaningful connection.
              </p>

              <button
                type="button"
                onClick={() =>
                  setNotice(
                    "Messaging will be connected when the backend integration is ready."
                  )
                }
              >
                Say hello <Icon name="message" size={15} />
              </button>
            </section>

          </aside>
        </div>
      </div>

      {/* FLOATING NAVIGATION */}

      <nav
        className="member-bottom-nav"
        aria-label="Main navigation"
      >
        <Link href="/">
          <Icon name="home" size={21} />
          <span>Home</span>
        </Link>

        <Link href="/#discover">
          <Icon name="search" size={21} />
          <span>Discover</span>
        </Link>

        <button
          type="button"
          onClick={() =>
            setNotice("Confessions will be available in a future milestone.")
          }
        >
          <Icon name="confessions" size={21} />
          <span>Confessions</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setNotice("SneakLinks will be connected in a future milestone.")
          }
        >
          <Icon name="heart" size={21} />
          <span>SneakLinks</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setNotice("Messages will be connected when the backend is ready.")
          }
        >
          <Icon name="message" size={21} />
          <span>Messages</span>
        </button>
      </nav>

      {/* MOMENT PHOTO PREVIEW */}

      {selectedMoment && (
        <div
          className="member-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Moment photo preview"
          onClick={() => setSelectedMoment(null)}
        >
          <div
            className="member-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="member-lightbox-close"
              onClick={() => setSelectedMoment(null)}
              aria-label="Close photo preview"
            >
              ×
            </button>

            <img
              src={selectedMoment.image}
              alt={selectedMoment.caption}
            />

            <div className="member-lightbox-caption">
              <strong>{selectedMoment.caption}</strong>
              <span>{selectedMoment.time}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* DYNAMIC PAGE WITH SUSPENSE */

export default function MemberProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="member-page">
          <div className="member-not-found">
            <p>Loading member profile...</p>
          </div>
        </main>
      }
    >
      <MemberProfileContent />
    </Suspense>
  );
}
