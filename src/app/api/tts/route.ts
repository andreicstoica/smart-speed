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
	speed: z.number().min(0.7).max(1.2).optional(),
	apply_text_normalization: z.enum(['on', 'off']).optional(),
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
			apply_text_normalization
		} = ttsSchema.parse(body);

		const client = new ElevenLabsClient({
			apiKey: process.env.ELEVENLABS_API_KEY!,
		});

		// Use new parameter names if provided, fallback to legacy names
		const finalVoiceId = voice_id || voiceId || "21m00Tcm4TlvDq8ikWAM";
		const finalModelId = model_id || modelId || "eleven_monolingual_v1";

		// Build the request config
		const requestConfig: any = {
			text,
			modelId: finalModelId,
			voiceSettings: {
				stability: 0.5,
				similarityBoost: 0.5,
			},
		};

		// Add smart speed parameters if provided
		if (speed !== undefined) {
			// ElevenLabs expects speed as a percentage (0.5 = 50%, 1.0 = 100%)
			requestConfig.outputFormat = "mp3_44100_128";
			// Note: ElevenLabs doesn't directly support speed parameter in v3
			// Speed is handled via voice settings or model capabilities
		}

		if (apply_text_normalization !== undefined) {
			requestConfig.normalizeText = apply_text_normalization === 'on';
		}

		const audio = await client.textToSpeech.convert(finalVoiceId, requestConfig);

		return new NextResponse(audio, {
			headers: {
				"Content-Type": "audio/mpeg",
				"Cache-Control": "public, max-age=3600",
			},
		});
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
