import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  // Playback rate control
  initialRate?: number; // if provided, set audio.playbackRate
  lockRate?: boolean; // if true, hide speed toggle and prevent changes
  hideSkipButtons?: boolean; // if true, hide rewind/forward buttons
}

export function AudioPlayer({
  audioUrl,
  title,
  subtitle,
  className,
  initialRate,
  lockRate,
  hideSkipButtons,
}: AudioPlayerProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(1);
  const volumeRef = useRef<HTMLDivElement>(null);

  const {
    audioRef,
    isPlaying,
    duration,
    currentTime,
    playbackSpeed,
    togglePlay,
    onScrubStart,
    onScrub,
    onScrubEnd,
    skipTime,
    toggleSpeed,
    formatTime,
  } = useAudioPlayer(audioUrl, {
    initialRate,
    lockRate,
  });

  const handleSpeedToggle = () => {
    toggleSpeed();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleVolumeSliderToggle = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeRef.current &&
        !volumeRef.current.contains(event.target as Node)
      ) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVolumeSlider]);

  return (
    <Card className={`p-6 ${className}`}>
      {/* Title and Subtitle */}
      {title && (
        <div className="text-center">
          <div className="mb-1 font-semibold text-gray-900 text-lg dark:text-gray-100">
            {title}
          </div>
          {subtitle && (
            <div className="text-gray-500 text-sm dark:text-gray-400">
              {subtitle}
            </div>
          )}
        </div>
      )}

      {/* Main Player Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          className="h-14 w-14 flex-shrink-0 rounded-full bg-black p-0 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200"
          disabled={!audioUrl}
          onClick={togglePlay}
          size="lg"
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 text-white dark:text-black" />
          ) : (
            <Play className="ml-1 h-7 w-7 text-white dark:text-black" />
          )}
        </Button>

        {/* Time and Progress Section */}
        <div className="flex-1 space-y-2">
          {/* Progress Bar */}
          <div className="w-full">
            <input
              className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              disabled={!audioUrl}
              max={duration}
              min={0}
              onChange={(e) => onScrub(Number(e.target.value))}
              onMouseDown={onScrubStart}
              onMouseUp={(e) =>
                onScrubEnd(Number((e.target as HTMLInputElement).value))
              }
              type="range"
              value={currentTime}
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-gray-600 text-sm dark:text-gray-400">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span className="font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="relative flex-shrink-0" ref={volumeRef}>
          <Button
            className="p-3 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            onClick={handleVolumeSliderToggle}
            size="sm"
            variant="ghost"
          >
            {volume === 0 ? (
              <VolumeX className="h-6 w-6" />
            ) : volume < 0.5 ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>

          {/* Volume Slider */}
          {showVolumeSlider && (
            <div className="absolute right-0 bottom-full mb-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-20 w-6 items-center justify-center">
                <input
                  className="slider h-1 w-20 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                  max={1}
                  min={0}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  step={0.01}
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                  type="range"
                  value={volume}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Rewind 5s */}
        {!hideSkipButtons && (
          <Button
            className="p-3 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            disabled={!audioUrl}
            onClick={() => skipTime(-5)}
            size="sm"
            variant="ghost"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="ml-2 font-medium text-sm">5</span>
          </Button>
        )}

        {/* Speed Toggle (hidden when locked) */}
        {!lockRate && (
          <Button
            className="px-4 py-2 font-medium text-base text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            disabled={!audioUrl}
            onClick={handleSpeedToggle}
            size="sm"
            variant="ghost"
          >
            {playbackSpeed}x
          </Button>
        )}

        {/* Forward 5s */}
        {!hideSkipButtons && (
          <Button
            className="p-3 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
            disabled={!audioUrl}
            onClick={() => skipTime(5)}
            size="sm"
            variant="ghost"
          >
            <span className="ml-2 font-medium text-sm">5</span>
            <RotateCw className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Hidden audio element */}
      {audioUrl && <audio preload="metadata" ref={audioRef} src={audioUrl} />}
    </Card>
  );
}
