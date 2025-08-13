import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { playSmart, ensureAudioContext, decodeAudio } from "../../lib/audio";

interface SmartSpeedPlayerProps {
  audioUrl?: string;
  text: string;
}

export function SmartSpeedPlayer({ audioUrl, text }: SmartSpeedPlayerProps) {
  const [smartPlaying, setSmartPlaying] = useState(false);
  const controllerRef = useRef<ReturnType<typeof playSmart> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSmartFromBaseline = async () => {
    if (!audioUrl) return;
    try {
      controllerRef.current?.stop();
      const res = await fetch(audioUrl);
      const arr = await res.arrayBuffer();
      const ctx = (audioContextRef.current ||= ensureAudioContext());
      const audioBuf = await decodeAudio(arr, ctx);
      const controller = playSmart(ctx, audioBuf, text);
      controllerRef.current = controller;
      setSmartPlaying(true);
      const endTimeout = window.setTimeout(
        () => setSmartPlaying(false),
        audioBuf.duration * 1000 + 1500
      );
      return () => window.clearTimeout(endTimeout);
    } catch (e) {
      console.error("Smart play failed:", e);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">Smart Speed</div>
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Button
            disabled={!audioUrl}
            onClick={playSmartFromBaseline}
            variant="secondary"
          >
            {smartPlaying ? "Playing..." : "Play Smart"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
