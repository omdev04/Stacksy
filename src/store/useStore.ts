import { create } from 'zustand';

// Random Username Generator
const ADJECTIVES = [
  'Retro', 'Aesthetic', 'Cosmic', 'Vibrant', 'Minimalist', 
  'Sleek', 'Pixel', 'Urban', 'Neon', 'Silent', 
  'Infinite', 'Wandering', 'Moody', 'Prismatic', 'Abstract'
];
const NOUNS = [
  'Badger', 'Otter', 'Panther', 'Falcon', 'Koala', 
  'Fox', 'Gazelle', 'Panda', 'Cheetah', 'Owl', 
  'Llama', 'Lynx', 'Lemur', 'Rabbit', 'Dolphin'
];
const PASTEL_COLORS = [
  '#FCA5A5', '#FDBA74', '#FDE047', '#86EFAC', '#93C5FD', 
  '#C084FC', '#F472B6', '#2DD4BF', '#A7F3D0', '#DDD6FE'
];

const generateIdentity = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
  const suffix = Math.floor(100 + Math.random() * 900); // 3-digit suffix for uniqueness
  return {
    username: `${adj}${noun}${suffix}`,
    color,
  };
};

interface AppState {
  // Identity
  username: string;
  userColor: string;
  updateUsername: (name: string) => void;
  updateUserColor: (color: string) => void;
  regenerateIdentity: () => void;

  // Custom API keys (UI Settings override)
  unsplashAccessKey: string | null;
  instantAppId: string | null;
  saveKeys: (unsplashKey: string, instantId: string) => void;
  clearKeys: () => void;

  // Gallery Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  category: string;
  setCategory: (category: string) => void;

  // View States
  selectedImageId: string | null;
  setSelectedImageId: (id: string | null) => void;
  selectedImageDetails: {
    url: string;
    description: string;
    author: string;
    authorUrl: string;
    downloadUrl: string;
  } | null;
  setSelectedImageDetails: (details: AppState['selectedImageDetails']) => void;

  // Settings Modal State
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => {
  // Read initial identity from localStorage or create new one
  let savedName = localStorage.getItem('stacksy_username');
  let savedColor = localStorage.getItem('stacksy_user_color');
  if (!savedName || !savedColor) {
    const ident = generateIdentity();
    savedName = ident.username;
    savedColor = ident.color;
    localStorage.setItem('stacksy_username', savedName);
    localStorage.setItem('stacksy_user_color', savedColor);
  }

  // Read saved API keys
  const savedUnsplashKey = localStorage.getItem('stacksy_unsplash_key');
  const savedInstantId = localStorage.getItem('stacksy_instant_app_id');

  return {
    username: savedName,
    userColor: savedColor,
    updateUsername: (name) => {
      localStorage.setItem('stacksy_username', name);
      set({ username: name });
    },
    updateUserColor: (color) => {
      localStorage.setItem('stacksy_user_color', color);
      set({ userColor: color });
    },
    regenerateIdentity: () => {
      const ident = generateIdentity();
      localStorage.setItem('stacksy_username', ident.username);
      localStorage.setItem('stacksy_user_color', ident.color);
      set({ username: ident.username, userColor: ident.color });
    },

    unsplashAccessKey: savedUnsplashKey,
    instantAppId: savedInstantId,
    saveKeys: (unsplashKey, instantId) => {
      const uKey = unsplashKey.trim();
      const iId = instantId.trim();
      if (uKey) {
        localStorage.setItem('stacksy_unsplash_key', uKey);
      } else {
        localStorage.removeItem('stacksy_unsplash_key');
      }
      if (iId) {
        localStorage.setItem('stacksy_instant_app_id', iId);
      } else {
        localStorage.removeItem('stacksy_instant_app_id');
      }
      set({ unsplashAccessKey: uKey || null, instantAppId: iId || null });
      // Reload page to apply new App ID initialization
      window.location.reload();
    },
    clearKeys: () => {
      localStorage.removeItem('stacksy_unsplash_key');
      localStorage.removeItem('stacksy_instant_app_id');
      set({ unsplashAccessKey: null, instantAppId: null });
      window.location.reload();
    },

    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    category: 'All',
    setCategory: (category) => set({ category, searchQuery: '' }), // reset search when clicking category

    selectedImageId: null,
    setSelectedImageId: (id) => set({ selectedImageId: id }),
    selectedImageDetails: null,
    setSelectedImageDetails: (details) => set({ selectedImageDetails: details }),

    // Settings Modal State
    isSettingsOpen: false,
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  };
});
