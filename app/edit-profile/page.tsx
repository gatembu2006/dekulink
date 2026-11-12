
"use client";

import { useEffect, useState } from "react";

import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";

import Link from "next/link";

type EditableProfile = {
  name: string;
  username: string;
  bio: string;
  interests: string[];
  photo: string;
};

const STORAGE_KEY = "dekulink-editable-profile";

const defaultProfile: EditableProfile = {
  name: "Joe",
  username: "@yourusername",
  bio: "",
  interests: [],
  photo: "",
};

export default function EditProfilePage() {
  const [profile, setProfile] = useState<EditableProfile>(defaultProfile);
  const [newInterest, setNewInterest] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as Partial<EditableProfile>;

        setProfile({
          ...defaultProfile,
          ...parsed,
          interests: Array.isArray(parsed.interests)
            ? parsed.interests
            : [],
        });
      }
    } catch {
      setMessage("Could not load your saved profile.");
    } finally {
      setLoaded(true);
    }
  }, []);

  const initials =
    profile.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "AG";

  function updateField(
    field: keyof EditableProfile,
    value: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addInterest() {
    const interest = newInterest.trim();

    if (!interest) return;

    const alreadyExists = profile.interests.some(
      (item) => item.toLowerCase() === interest.toLowerCase()
    );

    if (alreadyExists) {
      setMessage("That interest has already been added.");
      return;
    }

    if (profile.interests.length >= 12) {
      setMessage("You can add up to 12 interests.");
      return;
    }

    setProfile((current) => ({
      ...current,
      interests: [...current.interests, interest],
    }));

    setNewInterest("");
    setMessage("");
  }

  function removeInterest(interest: string) {
    setProfile((current) => ({
      ...current,
      interests: current.interests.filter(
        (item) => item !== interest
      ),
    }));
  }

  function handleInterestKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addInterest();
    }
  }

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage("Please choose an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("photo", reader.result);
        setMessage("Photo selected. Remember to save your changes.");
      }
    };

    reader.onerror = () => {
      setMessage("Could not read that image. Try another one.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile.name.trim()) {
      setMessage("Please enter your display name.");
      return;
    }

    if (!/^@[a-zA-Z0-9._]{2,30}$/.test(profile.username.trim())) {
      setMessage("Username must start with @ and contain 3–31 characters.");
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...profile,
          name: profile.name.trim(),
          username: profile.username.trim(),
          bio: profile.bio.trim(),
        })
      );

      setMessage("Your profile has been saved on this device!");
    } catch {
      setMessage("Could not save your profile. Try using a smaller photo.");
    }
  }

  if (!loaded) {
    return (
      <main className="edit-profile-page">
        <p className="edit-loading">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="edit-profile-page">
      <header className="edit-profile-header">
        <Link href="/" className="edit-profile-brand">
          <span className="edit-brand-icon">D</span>
          <span>Deku<span>Link</span></span>
        </Link>

        <Link href="/" className="edit-back-link">
          Cancel
        </Link>
      </header>

      <div className="edit-profile-container">
        <div className="edit-profile-heading">
          <span className="edit-eyebrow">MAKE IT YOURS</span>
          <h1>Edit your profile</h1>
          <p>
            Let the DekuLink community get to know the real you.
          </p>
        </div>

        <form onSubmit={saveProfile}>
          <section className="edit-profile-card">
            <div className="edit-section-heading">
              <div>
                <span className="edit-eyebrow">YOUR IDENTITY</span>
                <h2>Profile photo</h2>
              </div>
            </div>

            <div className="edit-photo-section">
              <div className="edit-avatar">
                {profile.photo ? (
                  <img src={profile.photo} alt="Your profile preview" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="edit-photo-actions">
                <strong>Make a great first impression.</strong>
                <p>Choose a profile photo. JPG, PNG or WebP, up to 1 MB.</p>

                <label className="edit-upload-button">
                  Change photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    hidden
                  />
                </label>

                {profile.photo && (
                  <button
                    type="button"
                    className="edit-remove-photo"
                    onClick={() => updateField("photo", "")}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="edit-profile-card">
            <div className="edit-section-heading">
              <div>
                <span className="edit-eyebrow">THE BASICS</span>
                <h2>Personal information</h2>
              </div>
            </div>

            <div className="edit-form-group">
              <label htmlFor="display-name">Display name</label>
              <input
                id="display-name"
                type="text"
                maxLength={50}
                value={profile.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Your name"
                required
              />
            </div>

            <div className="edit-form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                maxLength={31}
                value={profile.username}
                onChange={(event) =>
                  updateField("username", event.target.value)
                }
                placeholder="@yourusername"
                required
              />
              <small>Start your username with @.</small>
            </div>

            <div className="edit-form-group">
              <label htmlFor="bio">About me</label>
              <textarea
                id="bio"
                rows={4}
                maxLength={300}
                value={profile.bio}
                onChange={(event) =>
                  updateField("bio", event.target.value)
                }
                placeholder="Tell people a little about yourself..."
              />
              <small>{profile.bio.length}/300 characters</small>
            </div>
          </section>

          <section className="edit-profile-card">
            <div className="edit-section-heading">
              <div>
                <span className="edit-eyebrow">SHOW YOUR PERSONALITY</span>
                <h2>Interests & hobbies</h2>
              </div>
              <span className="edit-interest-count">
                {profile.interests.length}/12
              </span>
            </div>

            <div className="edit-interest-input">
              <input
                type="text"
                value={newInterest}
                maxLength={30}
                onChange={(event) => setNewInterest(event.target.value)}
                onKeyDown={handleInterestKeyDown}
                placeholder="Add an interest..."
              />

              <button
                type="button"
                onClick={addInterest}
                disabled={!newInterest.trim()}
              >
                + Add
              </button>
            </div>

            <div className="edit-interest-list">
              {profile.interests.length > 0 ? (
                profile.interests.map((interest) => (
                  <span className="edit-interest-tag" key={interest}>
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      aria-label={`Remove ${interest}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="edit-empty-interests">
                  Your interests will appear here. Add a few things you love!
                </p>
              )}
            </div>
          </section>

          {message && (
            <div className="edit-save-message" role="status">
              {message}
            </div>
          )}

          <div className="edit-profile-footer">
            <Link href="/" className="edit-cancel-button">
              Cancel
            </Link>

            <button type="submit" className="edit-save-button">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
