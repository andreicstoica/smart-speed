import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudioPlayer } from "./useAudioPlayer";
import { Timeline } from "./Timeline";
import { PlayerControls } from "./PlayerControls";
import { PlayerOverlay } from "./PlayerOverlay";

interface AudioPlayerProps {
  audioUrl?: string;
  text: string;
  isUsingSampleText: boolean;
  canRequest: boolean;
  loading: boolean;
  onRequestAudio: () => void;
}

export function AudioPlayer({
  audioUrl,
  text,
  isUsingSampleText,
  canRequest,
  loading,
  onRequestAudio,
}: AudioPlayerProps) {
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

  const hasAudio = !!audioUrl;
  const shouldShowOverlay = !hasAudio || text.trim().length === 0;

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">Baseline</div>
      <Card className="p-6 relative">
        {/* Inactive overlay when no audio */}
        {shouldShowOverlay && (
          <PlayerOverlay
            text={text}
            isUsingSampleText={isUsingSampleText}
            canRequest={canRequest}
            loading={loading}
            onRequestAudio={onRequestAudio}
          />
        )}

        {/* Audio Player UI */}
        <div
          className={`space-y-4 ${
            shouldShowOverlay ? "blur-sm pointer-events-none" : ""
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
              disabled={shouldShowOverlay}
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
            <Timeline
              currentTime={currentTime}
              duration={duration}
              onScrubStart={onScrubStart}
              onScrub={onScrub}
              onScrubEnd={onScrubEnd}
              formatTime={formatTime}
              disabled={shouldShowOverlay}
            />

            {/* Volume Control */}
            <Button variant="ghost" size="sm" className="p-2">
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Secondary Controls */}
          <PlayerControls
            skipTime={skipTime}
            toggleSpeed={toggleSpeed}
            playbackSpeed={playbackSpeed}
            disabled={shouldShowOverlay}
          />
        </div>

        {/* Hidden audio element, driven by custom controls */}
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
          onLoadStart={() => console.log("Audio loading started")}
          onCanPlay={() => console.log("Audio can play")}
          onError={(e) => console.log("Audio error:", e)}
        />
      </Card>
    </div>
  );
}
