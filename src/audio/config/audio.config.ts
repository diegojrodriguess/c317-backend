export interface AudioConfig {
    maxFileSize: number;
    allowedFormats: string[];
    allowedMimeTypes: string[];
    uploadDestination: string;
    pythonScriptPath: string;
    processingTimeout: number;
}

export const audioConfig: AudioConfig = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    // Inclui .opus para suportar envios do front e testes
    allowedFormats: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.opus'],
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/opus'],
    uploadDestination: './uploads',
    pythonScriptPath: '../../ia/process_audio.py',
    processingTimeout: 300000 // 5 minutos em ms
};