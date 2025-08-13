"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music,
} from "lucide-react";
import {
  playSmart,
  ensureAudioContext,
  createObjectUrlFromBuffer,
  revokeObjectUrl,
  decodeAudio,
} from "../lib/audio";
import { SAMPLE_TEXT } from "@/constants/sample";

async function fetchTts(
  text: string,
  voiceId?: string,
  modelId?: string
): Promise<ArrayBuffer> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId, modelId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "TTS failed");
  }
  return await res.arrayBuffer();
}

export function Players({ text }: { text: string }) {
  const [baselineUrl, setBaselineUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smartPlaying, setSmartPlaying] = useState(false);
  const controllerRef = useRef<ReturnType<typeof playSmart> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // custom baseline player state
  const baselineAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const speedOptions = [1, 1.5, 2, 3];

  // Add this state to track if we're using sample text
  const [isUsingSampleText, setIsUsingSampleText] = useState(false);

  // Add loading state for sample audio
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  useEffect(() => {
    return () => {
      revokeObjectUrl(baselineUrl);
      controllerRef.current?.stop();
      audioContextRef.current?.close().catch(() => {});
    };
  }, [baselineUrl]);

  // reset when a new baseline loads
  useEffect(() => {
    setIsPlaying(false);
    setDuration(0);
    setCurrentTime(0);
  }, [baselineUrl]);

  // wire up audio events
  useEffect(() => {
    const a = baselineAudioRef.current;
    if (!a) return;
    const onLoaded = () => setDuration(a.duration || 0);
    const onTime = () => {
      if (!isSeeking) setCurrentTime(a.currentTime || 0);
    };
    const onEnd = () => setIsPlaying(false);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [baselineUrl, isSeeking]);

  const togglePlay = () => {
    const a = baselineAudioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  const onScrubStart = () => setIsSeeking(true);
  const onScrub = (v: number) => setCurrentTime(v);
  const onScrubEnd = (v: number) => {
    const a = baselineAudioRef.current;
    setIsSeeking(false);
    if (a) a.currentTime = v;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const skipTime = (seconds: number) => {
    const a = baselineAudioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(a.duration, a.currentTime + seconds));
  };

  const toggleSpeed = () => {
    const currentIndex = speedOptions.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    const newSpeed = speedOptions[nextIndex];
    setPlaybackSpeed(newSpeed);

    // Apply speed to audio element
    const a = baselineAudioRef.current;
    if (a) {
      a.playbackRate = newSpeed;
    }
  };

  const canRequest = text.trim().length > 0;
  const hasAudio = !!baselineUrl;

  // Update the requestBaseline function
  const requestBaseline = async () => {
    if (!canRequest) return;

    // Only show loading for non-sample text
    if (text !== SAMPLE_TEXT) {
      setLoading(true);
    }

    setError(null);
    try {
      let buf: ArrayBuffer;

      if (text === SAMPLE_TEXT) {
        // Serve static file for sample text
        buf = await fetch("/audio/sample-audio.mp3").then((res) =>
          res.arrayBuffer()
        );
      } else {
        // Use API for custom text
        buf = await fetchTts(text);
      }

      const url = createObjectUrlFromBuffer(buf);
      revokeObjectUrl(baselineUrl);
      setBaselineUrl(url);
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      if (text !== SAMPLE_TEXT) {
        setLoading(false);
      }
    }
  };

  // Update the useEffect to auto-load sample audio on mount
  useEffect(() => {
    const isSample = text === SAMPLE_TEXT;
    setIsUsingSampleText(isSample);

    // Auto-load sample audio when using sample text and no audio exists
    if (isSample && !baselineUrl) {
      setIsLoadingSample(true);
      requestBaseline().finally(() => {
        setIsLoadingSample(false);
      });
    }
  }, [text]); // Remove baselineUrl from dependencies to avoid infinite loop

  const playSmartFromBaseline = async () => {
    if (!baselineUrl) return;
    try {
      controllerRef.current?.stop();
      const res = await fetch(baselineUrl);
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
      setError("Smart play failed");
    }
  };

  const downloadAudio = () => {
    if (!baselineUrl) return;

    const a = document.createElement("a");
    a.href = baselineUrl;
    a.download = "sample-audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Add this effect to debug the audio element
  useEffect(() => {
    console.log("Audio element src:", baselineAudioRef.current?.src);
    console.log("baselineUrl state:", baselineUrl);
  }, [baselineUrl]);

  // Add some debugging to see what's happening
  console.log("Debug states:", { hasAudio, isLoadingSample, baselineUrl });

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="text-sm font-medium">Baseline</div>
        <Card className="p-6 relative">
          {/* Inactive overlay when no audio */}
          {(!hasAudio || text.trim().length === 0) && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Music className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {text.trim().length === 0
                      ? "No Text Entered"
                      : isUsingSampleText
                      ? "Loading Sample Audio..."
                      : "No Audio Generated"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {text.trim().length === 0
                      ? "Enter some text to generate audio"
                      : isUsingSampleText
                      ? "Loading the sample audio file..."
                      : "Generate audio from your text to start playing"}
                  </p>
                </div>
                {text.trim().length > 0 && !isUsingSampleText && (
                  <Button
                    disabled={!canRequest || loading}
                    onClick={requestBaseline}
                    size="lg"
                    className="px-8"
                  >
                    {loading ? "Processing..." : "Generate Audio"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Audio Player UI */}
          <div
            className={`space-y-4 ${
              !hasAudio || text.trim().length === 0
                ? "blur-sm pointer-events-none"
                : ""
            }`}
          >
            {/* Title */}
            <div className="text-center">
              <div className="text-lg font-medium">Generated Audio</div>
              <div className="text-sm text-muted-foreground">
                Smart Speed Demo
              </div>
            </div>

            {/* Main Player Controls */}
            <div className="flex items-center gap-4">
              {/* Large Play/Pause Button */}
              <Button
                onClick={togglePlay}
                disabled={!hasAudio || text.trim().length === 0}
                size="lg"
                className="h-16 w-16 rounded-full p-0"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>

              {/* Timeline and Time Display */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono min-w-[3rem]">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      min={0}
                      max={Math.max(duration, 0.01)}
                      step="0.01"
                      value={currentTime}
                      onChange={(e) => onScrub(parseFloat(e.target.value))}
                      onMouseDown={onScrubStart}
                      onTouchStart={onScrubStart}
                      onMouseUp={(e) =>
                        onScrubEnd(
                          parseFloat((e.target as HTMLInputElement).value)
                        )
                      }
                      onTouchEnd={(e) =>
                        onScrubEnd(
                          parseFloat((e.target as HTMLInputElement).value)
                        )
                      }
                      aria-label="Timeline"
                    />
                  </div>
                  <span className="text-sm font-mono min-w-[3rem]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Volume Control */}
              <Button variant="ghost" size="sm" className="p-2">
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-15)}
                disabled={!hasAudio || text.trim().length === 0}
                className="flex items-center gap-1"
              >
                <SkipBack className="h-4 w-4" />
                <span className="text-xs">15</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSpeed}
                disabled={!hasAudio || text.trim().length === 0}
                className="font-medium"
              >
                {playbackSpeed}x
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(15)}
                disabled={!hasAudio || text.trim().length === 0}
                className="flex items-center gap-1"
              >
                <span className="text-xs">15</span>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add this after the main player controls */}
          {/* Remove the "Generate New Audio" button since it's now in the overlay */}

          {/* hidden audio element, driven by custom controls */}
          <audio
            ref={baselineAudioRef}
            src={baselineUrl}
            className="hidden"
            onLoadStart={() => console.log("Audio loading started")}
            onCanPlay={() => console.log("Audio can play")}
            onError={(e) => console.log("Audio error:", e)}
          />
        </Card>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Smart Speed</div>
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <Button
              disabled={!baselineUrl}
              onClick={playSmartFromBaseline}
              variant="secondary"
            >
              {smartPlaying ? "Playing..." : "Play Smart"}
            </Button>
          </div>
        </Card>
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}
    </div>
  );
}
