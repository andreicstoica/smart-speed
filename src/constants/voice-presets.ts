export type VoiceStyle = 'bedtime' | 'energetic';

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
            frequency: 'low' | 'medium' | 'high';
        };
        emphasis?: string[];
    };
}

export const VOICE_PRESETS: Record<VoiceStyle, VoicePreset> = {
    bedtime: {
        speed: 0.90,
        apply_text_normalization: true,
        model_id: 'eleven_v3',
        voice_id: 'GUDYcgRAONiI1nXDcNQQ', // Milo voice
        tags: {
            opening: ['[gentle tone]'],
            breaks: {
                min: 250,
                max: 300,
                frequency: 'medium'
            }
        }
    },
    energetic: {
        speed: 1.12,
        apply_text_normalization: true,
        model_id: 'eleven_v3',
        voice_id: 'JBFqnCBsd6RMkjVDRZzb', // George voice
        tags: {
            breaks: {
                min: 150,
                max: 200,
                frequency: 'low'
            },
            emphasis: ['[rushed]']
        }
    }
};

export function getPresetForStyle(style: VoiceStyle): VoicePreset {
    return VOICE_PRESETS[style];
}
