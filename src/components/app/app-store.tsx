"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  initialMatches,
  initialMessages,
  profiles as initialProfiles,
  likedByProfiles as initialLikedBy,
} from "@/lib/mock-data";
import type {
  Match,
  Message,
  Profile,
  SwipeDirection,
  SwipeRecord,
} from "@/lib/types";

export type Screen = "discover" | "matches" | "profile";

export interface Filters {
  ageMin: number;
  ageMax: number;
  maxDistanceKm: number;
  lookingFor: Profile["gender"][];
  onlyVerified: boolean;
}

const DEFAULT_FILTERS: Filters = {
  ageMin: 22,
  ageMax: 38,
  maxDistanceKm: 25,
  lookingFor: ["female", "male", "nonbinary"],
  onlyVerified: false,
};

interface AppState {
  profiles: Profile[];
  swipes: Record<string, SwipeRecord>;
  matches: Match[];
  messages: Record<string, Message[]>;
  likedBy: Profile[];
  filters: Filters;
  activeMatchId: string | null;
  activeChatId: string | null;
  matchModalProfileId: string | null;
  filtersOpen: boolean;
  editProfileOpen: boolean;
}

type Action =
  | { type: "swipe"; profileId: string; direction: SwipeDirection }
  | { type: "rewind" }
  | { type: "openMatchModal"; profileId: string | null }
  | { type: "openChat"; matchId: string | null }
  | { type: "sendMessage"; matchId: string; text: string }
  | { type: "markRead"; matchId: string }
  | { type: "setFilters"; filters: Partial<Filters> }
  | { type: "setFiltersOpen"; open: boolean }
  | { type: "setEditProfileOpen"; open: boolean }
  | { type: "reset" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "swipe": {
      const profile = state.profiles.find((p) => p.id === action.profileId);
      if (!profile) return state;

      const swipes = {
        ...state.swipes,
        [action.profileId]: {
          profileId: action.profileId,
          direction: action.direction,
          at: new Date().toISOString(),
        },
      };

      // Simulate mutual like: profiles 03, 05, 07 like us back
      const isMutualLike =
        action.direction !== "pass" &&
        ["u_03", "u_05", "u_07"].includes(action.profileId);

      let matches = state.matches;
      let messages = state.messages;

      if (isMutualLike) {
        const matchId = `m_${action.profileId}`;
        const exists = matches.some((m) => m.id === matchId);
        if (!exists) {
          const newMatch: Match = {
            id: matchId,
            profileId: action.profileId,
            createdAt: new Date().toISOString(),
            unread: 0,
          };
          matches = [newMatch, ...matches];
          messages = { ...messages, [matchId]: [] };
          return {
            ...state,
            swipes,
            matches,
            messages,
            matchModalProfileId: action.profileId,
          };
        }
      }

      return { ...state, swipes, matches, messages };
    }
    case "rewind": {
      const entries = Object.values(state.swipes).sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      );
      if (entries.length === 0) return state;
      const last = entries[0];
      const swipes = { ...state.swipes };
      delete swipes[last.profileId];
      return { ...state, swipes };
    }
    case "openMatchModal":
      return { ...state, matchModalProfileId: action.profileId };
    case "openChat":
      return { ...state, activeChatId: action.matchId };
    case "sendMessage": {
      const msg: Message = {
        id: `msg_${Date.now()}`,
        matchId: action.matchId,
        authorId: "me",
        text: action.text,
        createdAt: new Date().toISOString(),
        read: true,
      };
      const list = [...(state.messages[action.matchId] ?? []), msg];
      const messages = { ...state.messages, [action.matchId]: list };
      const matches = state.matches.map((m) =>
        m.id === action.matchId ? { ...m, lastMessage: msg } : m
      );
      return { ...state, messages, matches };
    }
    case "markRead": {
      const matches = state.matches.map((m) =>
        m.id === action.matchId ? { ...m, unread: 0 } : m
      );
      const messages = {
        ...state.messages,
        [action.matchId]: (state.messages[action.matchId] ?? []).map((m) => ({
          ...m,
          read: true,
        })),
      };
      return { ...state, matches, messages };
    }
    case "setFilters":
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case "setFiltersOpen":
      return { ...state, filtersOpen: action.open };
    case "setEditProfileOpen":
      return { ...state, editProfileOpen: action.open };
    case "reset":
      return {
        profiles: initialProfiles,
        swipes: {},
        matches: initialMatches,
        messages: initialMessages,
        likedBy: initialLikedBy,
        filters: DEFAULT_FILTERS,
        activeMatchId: null,
        activeChatId: null,
        matchModalProfileId: null,
        filtersOpen: false,
      };
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  deck: Profile[];
  likedYou: Profile[];
  matchesSorted: Match[];
  totalUnread: number;
  swipe: (profileId: string, direction: SwipeDirection) => void;
  rewind: () => void;
  openMatchModal: (profileId: string | null) => void;
  openChat: (matchId: string | null) => void;
  sendMessage: (matchId: string, text: string) => void;
  markRead: (matchId: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setFiltersOpen: (open: boolean) => void;
  setEditProfileOpen: (open: boolean) => void;
  getProfile: (id: string) => Profile | undefined;
  getMatch: (id: string) => Match | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppStoreProvider>");
  return ctx;
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    profiles: initialProfiles,
    swipes: {},
    matches: initialMatches,
    messages: initialMessages,
    likedBy: initialLikedBy,
    filters: DEFAULT_FILTERS,
    activeMatchId: null,
    activeChatId: null,
    matchModalProfileId: null,
    filtersOpen: false,
    editProfileOpen: false,
  }));

  const profileIndex = useRef<Map<string, Profile>>(new Map());
  useEffect(() => {
    profileIndex.current = new Map(state.profiles.map((p) => [p.id, p]));
  }, [state.profiles]);

  const deck = useMemo(() => {
    const swiped = new Set(Object.keys(state.swipes));
    return state.profiles.filter((p) => {
      if (swiped.has(p.id)) return false;
      if (p.age < state.filters.ageMin || p.age > state.filters.ageMax) return false;
      if (p.distanceKm > state.filters.maxDistanceKm) return false;
      if (state.filters.onlyVerified && !p.verified) return false;
      if (
        state.filters.lookingFor.length > 0 &&
        !state.filters.lookingFor.includes(p.gender)
      ) {
        return false;
      }
      return true;
    });
  }, [state.profiles, state.swipes, state.filters]);

  const likedYou = useMemo(
    () => state.likedBy.filter((p) => !state.matches.some((m) => m.profileId === p.id)),
    [state.likedBy, state.matches]
  );

  const matchesSorted = useMemo(
    () =>
      [...state.matches].sort((a, b) => {
        const at = a.lastMessage?.createdAt ?? a.createdAt;
        const bt = b.lastMessage?.createdAt ?? b.createdAt;
        return new Date(bt).getTime() - new Date(at).getTime();
      }),
    [state.matches]
  );

  const totalUnread = useMemo(
    () => state.matches.reduce((sum, m) => sum + m.unread, 0),
    [state.matches]
  );

  const swipe = useCallback((profileId: string, direction: SwipeDirection) => {
    dispatch({ type: "swipe", profileId, direction });
  }, []);
  const rewind = useCallback(() => dispatch({ type: "rewind" }), []);
  const openMatchModal = useCallback(
    (profileId: string | null) => dispatch({ type: "openMatchModal", profileId }),
    []
  );
  const openChat = useCallback(
    (matchId: string | null) => dispatch({ type: "openChat", matchId }),
    []
  );
  const sendMessage = useCallback(
    (matchId: string, text: string) => dispatch({ type: "sendMessage", matchId, text }),
    []
  );
  const markRead = useCallback(
    (matchId: string) => dispatch({ type: "markRead", matchId }),
    []
  );
  const setFilters = useCallback(
    (filters: Partial<Filters>) => dispatch({ type: "setFilters", filters }),
    []
  );
  const setFiltersOpen = useCallback(
    (open: boolean) => dispatch({ type: "setFiltersOpen", open }),
    []
  );
  const setEditProfileOpen = useCallback(
    (open: boolean) => dispatch({ type: "setEditProfileOpen", open }),
    []
  );

  const getProfile = useCallback(
    (id: string) => profileIndex.current.get(id),
    []
  );
  const getMatch = useCallback(
    (id: string) => state.matches.find((m) => m.id === id),
    [state.matches]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      dispatch,
      deck,
      likedYou,
      matchesSorted,
      totalUnread,
      swipe,
      rewind,
      openMatchModal,
      openChat,
      sendMessage,
      markRead,
      setFilters,
      setFiltersOpen,
      setEditProfileOpen,
      getProfile,
      getMatch,
    }),
    [
      state,
      deck,
      likedYou,
      matchesSorted,
      totalUnread,
      swipe,
      rewind,
      openMatchModal,
      openChat,
      sendMessage,
      markRead,
      setFilters,
      setFiltersOpen,
      getProfile,
      getMatch,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}