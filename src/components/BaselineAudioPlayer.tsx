import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AudioPlayer } from "./audio/AudioPlayer";
import { useTts } from "./audio/useTts";

interface BaselineAudioPlayerProps {
  text: string;
}

export function BaselineAudioPlayer({ text }: BaselineAudioPlayerProps) {
  const { audioUrl, requestAudio, loading, isUsingSampleText } = useTts(text);
  const hasText = text.trim().length > 0;

  return (
    <>
      {/* Generate Button or Player */}
      {!audioUrl ? (
        <div className="flex justify-center">
          <Button
            onClick={requestAudio}
            disabled={!hasText || loading}
            size="lg"
            className="px-8"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </div>
            ) : (
              "Generate Original"
            )}
          </Button>
        </div>
      ) : (
        <AudioPlayer
          audioUrl={audioUrl}
          title="Baseline Generated Audio"
          subtitle={
            isUsingSampleText
              ? "Using sample audio"
              : "Standard text-to-speech without enhancements"
          }
        />
      )}
    </>
  );
}
