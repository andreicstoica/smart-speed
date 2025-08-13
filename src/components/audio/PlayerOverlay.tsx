import { Button } from "../ui/button";
import { Music } from "lucide-react";

interface PlayerOverlayProps {
  text: string;
  isUsingSampleText: boolean;
  canRequest: boolean;
  loading: boolean;
  onRequestAudio: () => void;
}

export function PlayerOverlay({
  text,
  isUsingSampleText,
  canRequest,
  loading,
  onRequestAudio,
}: PlayerOverlayProps) {
  const hasText = text.trim().length > 0;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Music className="h-8 w-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {!hasText
              ? "No Text Entered"
              : isUsingSampleText
              ? "Loading Sample Audio..."
              : "No Audio Generated"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {!hasText
              ? "Enter some text to generate audio"
              : isUsingSampleText
              ? "Loading the sample audio file..."
              : "Generate audio from your text to start playing"}
          </p>
        </div>
        {hasText && !isUsingSampleText && (
          <Button
            disabled={!canRequest || loading}
            onClick={onRequestAudio}
            size="lg"
            className="px-8"
          >
            {loading ? "Processing..." : "Generate Audio"}
          </Button>
        )}
      </div>
    </div>
  );
}
