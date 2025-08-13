import { AudioPlayer } from "./audio/AudioPlayer";
import { useTts } from "./audio/useTts";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface BaselineAudioPlayerProps {
	text: string;
}

export function BaselineAudioPlayer({ text }: BaselineAudioPlayerProps) {
	const { audioUrl, requestAudio, loading, isUsingSampleText } = useTts(text);
	const hasText = text.trim().length > 0;

	return (
		<>
			{/* Generate Button or Player */}
			{audioUrl ? (
				<AudioPlayer
					audioUrl={audioUrl}
					subtitle={
						isUsingSampleText
							? "Using sample audio"
							: "Standard text-to-speech without enhancements"
					}
					title="Baseline Generated Audio"
				/>
			) : (
				<div className="flex justify-center">
					<Button
						className="px-8"
						disabled={!hasText || loading}
						onClick={requestAudio}
						size="lg"
					>
						{loading ? (
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Generating...
							</div>
						) : (
							"Generate Original"
						)}
					</Button>
				</div>
			)}
		</>
	);
}
