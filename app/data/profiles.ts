
export type Moment = {
  id: string;
  image: string;
  caption: string;
  time: string;
};

export type Profile = {
  id: number;
  name: string;
  username: string;
  bio: string;
  initials: string;
  color: string;
  online: boolean;
  interests: string[];
  photo?: string;
  moments: Moment[];
};

export const profiles: Profile[] = [
  {
    id: 1,
    name: "Michelle",
    username: "@michelle.k",
    bio: "Architecture student | Coffee enthusiast ☕",
    initials: "MK",
    color: "blue",
    online: true,
    interests: ["Music", "Travel"],
    photo: "https://i.pravatar.cc/300?img=47",
    moments: [
      {
        id: "michelle-1",
        image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=85",
        caption: "Architecture is art you can walk through.",
        time: "2 days ago",
      },
      {
        id: "michelle-2",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
        caption: "Coffee first, everything else later ☕",
        time: "4 days ago",
      },
      {
        id: "michelle-3",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
        caption: "Collecting memories, not things.",
        time: "1 week ago",
      },
    ],
  },
  {
    id: 2,
    name: "Brian",
    username: "@brian.m",
    bio: "Building things and chasing dreams.",
    initials: "BM",
    color: "purple",
    online: true,
    interests: ["Tech", "Gaming"],
    photo: "https://i.pravatar.cc/300?img=12",
    moments: [
      {
        id: "brian-1",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85",
        caption: "Ideas become reality when you start building.",
        time: "Yesterday",
      },
      {
        id: "brian-2",
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=85",
        caption: "Game night is serious business 🎮",
        time: "3 days ago",
      },
    ],
  },
  {
    id: 3,
    name: "Sharon",
    username: "@sharon.w",
    bio: "A little sunshine in a busy world.",
    initials: "SW",
    color: "pink",
    online: false,
    interests: ["Art", "Music"],
    photo: "https://i.pravatar.cc/300?img=44",
    moments: [
      {
        id: "sharon-1",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85",
        caption: "A little creativity makes everything brighter.",
        time: "2 days ago",
      },
      {
        id: "sharon-2",
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=85",
        caption: "Music makes ordinary days special.",
        time: "5 days ago",
      },
    ],
  },
  {
    id: 4,
    name: "Kevin",
    username: "@kevin.o",
    bio: "Football, photography and good vibes.",
    initials: "KO",
    color: "green",
    online: true,
    interests: ["Football", "Photography"],
    photo: "https://i.pravatar.cc/300?img=13",
    moments: [
      {
        id: "kevin-1",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85",
        caption: "Football is more than just a game.",
        time: "Yesterday",
      },
      {
        id: "kevin-2",
        image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85",
        caption: "Chasing the perfect shot.",
        time: "4 days ago",
      },
    ],
  },
];
