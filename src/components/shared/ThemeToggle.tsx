"use client";

import { useTheme } from "next-themes";

import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      suppressHydrationWarning
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="size-5" />
      ) : (
        <Moon className="size-5" />
      )}
    </button>
  );
}
