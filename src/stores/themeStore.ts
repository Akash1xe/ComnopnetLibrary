import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  initialize: () => void;
  toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  initialize: () => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "dark";
    applyTheme(stored);
    set({ theme: stored });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
    set({ theme: next });
  },
}));
