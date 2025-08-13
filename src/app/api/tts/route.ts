import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ttsSchema = z.object({
	text: z.string().min(1).max(5000),
	voiceId: z.string().optional(),
	modelId: z.string().optional(),
});

export async function GET() {
	const hasKey = Boolean(process.env.ELEVENLABS_API_KEY);
	return NextResponse.json({ ok: true, hasKey });
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { text, voiceId, modelId } = ttsSchema.parse(body);

		const client = new ElevenLabsClient({
			apiKey: process.env.ELEVENLABS_API_KEY!,
		});

		const audio = await client.textToSpeech.convert(
			voiceId || "21m00Tcm4TlvDq8ikWAM", // Default voice
			{
				text,
				modelId: modelId || "eleven_monolingual_v1",
				voiceSettings: {
					stability: 0.5,
					similarityBoost: 0.5,
				},
			}
		);

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
