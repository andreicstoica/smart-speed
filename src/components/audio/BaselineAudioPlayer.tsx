import { AudioPlayer } from "./AudioPlayer";
import { useTts } from "@/hooks/useTts";
import { Button } from "../ui/button";

interface BaselineAudioPlayerProps {
  text: string;
  playbackRate?: number;
}

export function BaselineAudioPlayer({
  text,
  playbackRate,
}: BaselineAudioPlayerProps) {
  const { audioUrl, requestAudio, loading, isUsingSampleText } = useTts(text);
  const hasText = text.trim().length > 0;

  return (
    <AudioPlayer
      audioUrl={audioUrl}
      subtitle={
        audioUrl
          ? isUsingSampleText
            ? "Using sample audio"
            : "Standard text-to-speech without enhancements"
          : "I've found that .25x less is equivalent in feeling"
      }
      title="Baseline Generated Audio"
      initialRate={playbackRate ? Math.max(0.25, playbackRate - 0.25) : 1}
      hideSkipButtons
      disabled={!audioUrl}
      overlayContent={
        !audioUrl ? (
          <Button
            className="px-8"
            disabled={!hasText || loading}
            onClick={requestAudio}
            size="lg"
            variant="outline"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white" />
                Generating...
              </div>
            ) : (
              "Generate Original"
            )}
          </Button>
        ) : undefined
      }
    />
  );
}
