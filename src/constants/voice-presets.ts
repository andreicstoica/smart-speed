export type VoiceStyle = "bedtime" | "energetic";

export interface VoicePreset {
	speed: number;
	apply_text_normalization: boolean;
	model_id: string;
	voice_id: string;
	tags: {
		opening?: string[];
		breaks: {
			min: number;
			max: number;
			frequency: "low" | "medium" | "high";
		};
		emphasis?: string[];
	};
}

// V2-specific presets (simplified, no style tags)
export const V2_PRESETS = {
	bedtime: {
		speed: 0.9,
		apply_text_normalization: false, // V1 doesn't support normalization
		model_id: "eleven_multilingual_v2", // V1 model
		voice_id: "GUDYcgRAONiI1nXDcNQQ", // Milo voice
		tags: {
			breaks: {
				min: 250,
				max: 300,
				frequency: "medium",
			},
		},
	},
	energetic: {
		speed: 1.12,
		apply_text_normalization: false, // V1 doesn't support normalization
		model_id: "eleven_multilingual_v2", // V1 model
		voice_id: "JBFqnCBsd6RMkjVDRZzb", // George voice
		tags: {
			breaks: {
				min: 150,
				max: 200,
				frequency: "low",
			},
		},
	},
};

export function getPresetForStyle(style: VoiceStyle): VoicePreset {
	return V2_PRESETS[style];
}
