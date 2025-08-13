interface TimelineProps {
  currentTime: number;
  duration: number;
  onScrubStart: () => void;
  onScrub: (value: number) => void;
  onScrubEnd: (value: number) => void;
  formatTime: (time: number) => string;
  disabled?: boolean;
}

export function Timeline({
  currentTime,
  duration,
  onScrubStart,
  onScrub,
  onScrubEnd,
  formatTime,
  disabled = false,
}: TimelineProps) {
  return (
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
              onScrubEnd(parseFloat((e.target as HTMLInputElement).value))
            }
            onTouchEnd={(e) =>
              onScrubEnd(parseFloat((e.target as HTMLInputElement).value))
            }
            disabled={disabled}
            aria-label="Timeline"
          />
        </div>
        <span className="text-sm font-mono min-w-[3rem]">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
