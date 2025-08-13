import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ttsSchema = z.object({
	text: z.string().min(1).max(5000),
	voiceId: z.string().optional(),
	modelId: z.string().optional(),
	// Smart Speed parameters
	voice_id: z.string().optional(),
	model_id: z.string().optional(),
	speed: z.number().min(0.75).max(3.0).optional(),
	apply_text_normalization: z.enum(["on", "off"]).optional(),
});

export async function GET() {
	const hasKey = Boolean(process.env.ELEVENLABS_API_KEY);
	return NextResponse.json({ ok: true, hasKey });
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			text,
			voiceId,
			modelId,
			voice_id,
			model_id,
			speed,
			apply_text_normalization,
		} = ttsSchema.parse(body);

		// Use new parameter names if provided, fallback to legacy names
		const finalVoiceId = voice_id || voiceId || "21m00Tcm4TlvDq8ikWAM";
		const finalModelId = model_id || modelId || "eleven_multilingual_v3";

		// Initialize ElevenLabs v3 client
		const client = new ElevenLabsClient({
			apiKey: process.env.ELEVENLABS_API_KEY!,
		});

		// Build the request config for v3 API
		const requestConfig: any = {
			text,
			modelId: finalModelId,
			voiceSettings: {
				stability: 0.5,
				similarityBoost: 0.5,
				style: 0.0, // Default style setting for v3
				useSpeakerBoost: true, // Enable speaker boost for better quality
			},
		};

		// Add smart speed parameters if provided
		if (speed !== undefined) {
			// For v3, speed is controlled via audio tags in the text
			// The speed parameter from Smart Speed will be handled by the tagging system
			requestConfig.outputFormat = "mp3_44100_128";
		}

		if (apply_text_normalization !== undefined) {
			requestConfig.normalizeText = apply_text_normalization === "on";
		}

		// Use v3 API with proper error handling
		try {
			const audio = await client.textToSpeech.convert(
				finalVoiceId,
				requestConfig
			);
			return new NextResponse(audio, {
				headers: {
					"Content-Type": "audio/mpeg",
					"Cache-Control": "public, max-age=3600",
				},
			});
		} catch (error: any) {
			// Handle v3 access errors gracefully
			if (
				error.statusCode === 403 &&
				error.body?.detail?.status === "model_access_denied"
			) {
				console.error(
					"ElevenLabs v3 access denied. Please contact sales for early access."
				);
				return NextResponse.json(
					{
						error:
							"ElevenLabs v3 access required. Please contact sales@elevenlabs.io for early access to use Smart Speed features.",
					},
					{ status: 403 }
				);
			}
			throw error;
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data" },
				{ status: 400 }
			);
		}

		console.error("TTS Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
