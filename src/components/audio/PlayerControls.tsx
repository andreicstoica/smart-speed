import { Button } from "../ui/button";
import { SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  skipTime: (seconds: number) => void;
  toggleSpeed: () => void;
  playbackSpeed: number;
  disabled?: boolean;
}

export function PlayerControls({
  skipTime,
  toggleSpeed,
  playbackSpeed,
  disabled = false,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => skipTime(-15)}
        disabled={disabled}
        className="flex items-center gap-1"
      >
        <SkipBack className="h-4 w-4" />
        <span className="text-xs">15</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSpeed}
        disabled={disabled}
        className="font-medium"
      >
        {playbackSpeed}x
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => skipTime(15)}
        disabled={disabled}
        className="flex items-center gap-1"
      >
        <span className="text-xs">15</span>
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
}
