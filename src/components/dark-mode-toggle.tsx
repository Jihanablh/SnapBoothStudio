"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("snapbooth.theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark"; // default dark
}

function applyTheme(theme: "dark" | "light") {
  const html = document.documentElement;
  if (theme === "light") {
    html.classList.add("light");
    html.classList.remove("dark");
  } else {
    html.classList.remove("light");
    html.classList.add("dark");
  }
}

export function useDarkMode() {
  const [theme, setTheme] = useState<"dark" | "light">(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("snapbooth.theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle };
}

interface DarkModeToggleProps {
  theme: "dark" | "light";
  toggle: () => void;
  className?: string;
}

export function DarkModeToggle({ theme, toggle, className = "" }: DarkModeToggleProps) {
  return (
    <button
      onClick={toggle}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:border-primary/40 hover:bg-white/10 ${className}`}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative h-5 w-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 text-amber-400 transition-all duration-300 ${
            theme === "light" ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-50"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 text-primary transition-all duration-300 ${
            theme === "dark" ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"
          }`}
        />
      </div>
      <span className="sr-only">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
