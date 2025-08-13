"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { INTRO_TEXT, INTRO_DETAILS } from "@/constants/intro";

export function IntroModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal on first visit (check localStorage)
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (!hasSeenIntro) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-w-2xl p-6">
        <div>
          <h2 className="mb-2 text-xl font-semibold">
            Welcome to Smart Speed!
          </h2>
          <p className="text-muted-foreground text-sm">
            A text-to-speech experiment with intelligent speed adjustment
          </p>
        </div>

        <div className="overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base">Why I made this</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {INTRO_TEXT}
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-base">How I used ElevenLabs</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {INTRO_DETAILS}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleClose} size="lg">
            Get Started
          </Button>
        </div>
      </Card>
    </div>
  );
}
