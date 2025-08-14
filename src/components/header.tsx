"use client";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const resetIntro = () => {
    localStorage.removeItem("hasSeenIntro");
    window.location.reload();
  };

  return (
    <div className="flex flex-row items-center justify-end px-2 py-1">
      <div className="flex items-center gap-2">
        <Button
          onClick={resetIntro}
          size="sm"
          variant="ghost"
          className="text-xs"
        >
          Reset Intro
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
}
