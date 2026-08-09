"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("trait-coach:theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("trait-coach:theme", next ? "dark" : "light");
  };

  if (!mounted) {
    return <div className="h-10 w-10 rounded-xl border border-re-border" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-ghost p-2.5"
      aria-label={dark ? "라이트 모드" : "다크 모드"}
    >
      {dark ? <Sun className="h-5 w-5 text-re-gold" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
