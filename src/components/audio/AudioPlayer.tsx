import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useAudioPlayer } from "./useAudioPlayer";

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  title,
  subtitle,
  className,
}: AudioPlayerProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
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
  } = useAudioPlayer(audioUrl);

  const speedOptions = [0.75, 1, 1.5, 2, 3];
  const currentSpeedIndex = speedOptions.indexOf(playbackSpeed);

  const handleSpeedToggle = () => {
    const nextIndex = (currentSpeedIndex + 1) % speedOptions.length;
    const newSpeed = speedOptions[nextIndex];
    toggleSpeed();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleVolumeToggle = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      handleVolumeChange(0);
    } else {
      handleVolumeChange(previousVolume);
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
        <div className="text-center mb-6">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </div>
          )}
        </div>
      )}

      {/* Main Player Controls */}
      <div className="flex items-center gap-4 mb-6">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlay}
          disabled={!audioUrl}
          size="lg"
          className="h-14 w-14 rounded-full p-0 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 text-white dark:text-black" />
          ) : (
            <Play className="h-7 w-7 text-white dark:text-black ml-1" />
          )}
        </Button>

        {/* Time and Progress Section */}
        <div className="flex-1 space-y-2">
          {/* Progress Bar */}
          <div className="w-full">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => onScrub(Number(e.target.value))}
              onMouseDown={onScrubStart}
              onMouseUp={(e) =>
                onScrubEnd(Number((e.target as HTMLInputElement).value))
              }
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              disabled={!audioUrl}
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span className="font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="relative flex-shrink-0" ref={volumeRef}>
          <Button
            variant="ghost"
            size="sm"
            className="p-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleVolumeSliderToggle}
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
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-6 h-20 flex items-center justify-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Rewind 5s */}
        <Button
          onClick={() => skipTime(-5)}
          variant="ghost"
          size="sm"
          className="p-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          disabled={!audioUrl}
        >
          <RotateCcw className="h-5 w-5" />
          <span className="ml-2 text-sm font-medium">5</span>
        </Button>

        {/* Speed Toggle */}
        <Button
          onClick={handleSpeedToggle}
          variant="ghost"
          size="sm"
          className="px-4 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-base"
          disabled={!audioUrl}
        >
          {playbackSpeed}x
        </Button>

        {/* Forward 5s */}
        <Button
          onClick={() => skipTime(5)}
          variant="ghost"
          size="sm"
          className="p-3 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          disabled={!audioUrl}
        >
          <RotateCw className="h-5 w-5" />
          <span className="ml-2 text-sm font-medium">5</span>
        </Button>
      </div>

      {/* Hidden audio element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    </Card>
  );
}
