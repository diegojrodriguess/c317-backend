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
        feedback?: string;
        match?: boolean;
        evaluation?: string;
        processedAt: string;
        pdf?: string;
    };
}

export interface ProcessedAudioResult {
    success: boolean;
    transcription?: string;
    score?: number;
    message?: string;
    match?: boolean;
    evaluation?: string;
    processedAt: string;
    errors?: string[];
    suggestions?: string[];
    highlights?: any;
}