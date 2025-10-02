export interface AudioUploadResponse {
    statusCode: number;
    message: string;
    data: {
        originalName: string;
        filename: string;
        size: number;
        mimetype: string;
        success: boolean;
        transcription?: string;
        score?: number;
        processedAt: string;
        audioMessage?: string;
    };
}

export interface ProcessedAudioResult {
    success: boolean;
    transcription?: string;
    score?: number;
    message?: string;
    processedAt: string;
}