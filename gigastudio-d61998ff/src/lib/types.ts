export type Gender = "male" | "female" | "nonbinary";

export interface Photo {
  id: string;
  url: string;
  blurhash?: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  photos: Photo[];
  interests: string[];
  occupation: string;
  city: string;
  distanceKm: number;
  verified: boolean;
  online: boolean;
  lastSeen?: string;
  height?: number;
  lookingFor: Gender[];
  maxDistanceKm: number;
  ageRange: [number, number];
}

export interface Message {
  id: string;
  matchId: string;
  authorId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Match {
  id: string;
  profileId: string;
  createdAt: string;
  unread: number;
  lastMessage?: Message;
}

export type SwipeDirection = "like" | "pass" | "super";

export interface SwipeRecord {
  profileId: string;
  direction: SwipeDirection;
  at: string;
}
