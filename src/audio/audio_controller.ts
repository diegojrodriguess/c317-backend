import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    HttpStatus,
    HttpCode,
    Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AudioService } from './audio_service';
import { AudioUploadResponse } from './dto/audio-upload.dto';
import { audioConfig } from './config/audio.config';
import { ConsultationService } from './consultation.service';
import { PdfService } from './pdf.service';
import { Get, Param } from '@nestjs/common';

@Controller('audio')
export class AudioController {
    constructor(
        private readonly audioService: AudioService,
        private readonly consultationService: ConsultationService,
        private readonly pdfService: PdfService,
    ) {}

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('audio', {
            storage: diskStorage({
                destination: audioConfig.uploadDestination,
                filename: (req, file, cb) => {
                    // Validar tipo de arquivo
                    const fileExt = extname(file.originalname).toLowerCase();
                    
                    if (!audioConfig.allowedFormats.includes(fileExt)) {
                        const allowedFormatsStr = audioConfig.allowedFormats.join(', ');
                        return cb(new Error(`Tipo de arquivo não suportado. Use: ${allowedFormatsStr}`), null);
                    }
                    
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
                }
            }),
            limits: {
                fileSize: audioConfig.maxFileSize,
            },
            fileFilter: (req, file, cb) => {
                // Verificar se é arquivo de áudio válido
                if (audioConfig.allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
                    cb(null, true);
                } else {
                    cb(new Error('Apenas arquivos de áudio são permitidos'), false);
                }
            }
        })
    )
    async uploadAudio(
        @UploadedFile() file: any,
        @Body('user_id') user_id?: string,
        @Body('target_word') target_word?: string,
        @Body('provider') provider: string = 'gemini',
    ): Promise<AudioUploadResponse> {
        // console.log("REQ FILE >>>", file);
        // Verificar se o arquivo foi enviado
        if (!file) {
            throw new BadRequestException('Nenhum arquivo de áudio foi enviado');
        }

        // Validações adicionais de segurança
        if (!file.path || !file.filename) {
            throw new BadRequestException('Arquivo inválido ou corrompido');
        }

        // Verificar se o arquivo tem tamanho válido
        if (file.size === 0) {
            throw new BadRequestException('Arquivo de áudio está vazio');
        }

        try {
            // Processar o áudio através do serviço (passando target_word/provider quando disponíveis)
            const result = await this.audioService.processAudio(file.path, { targetWord: target_word, provider, userId: user_id });

            // Salvar consulta no banco
            const saved = await this.consultationService.saveConsultation({
                userId: user_id || 'anonymous',
                targetWord: target_word,
                transcription: result.transcription,
                score: result.score,
                feedback: result.message,
                errors: result.errors || [],
                suggestions: result.suggestions || [],
                highlights: result.highlights || {},
                audioFilename: file.filename,
                transcriptionProvider: provider,
            });

            // Gerar PDF do relatório
            let pdfPath = '';
            try {
                pdfPath = await this.pdfService.generatePdf({
                    userId: user_id,
                    targetWord: target_word,
                    transcription: result.transcription,
                    score: result.score,
                    feedback: result.message,
                    suggestions: result.suggestions || []
                });

                // atualizar registro com pdfPath (garantir string para o id)
                try {
                    const rawId: any = (saved as any)?._id ?? (saved as any);
                    const savedId = rawId && typeof rawId.toString === 'function' ? rawId.toString() : String(rawId);
                    await this.consultationService.updateConsultationPdf(savedId, pdfPath);
                } catch (e) { /* ignore */ }
            } catch (pdfErr) {
                console.error('Erro ao gerar PDF:', pdfErr);
            }

            return {
                statusCode: HttpStatus.OK,
                message: 'Áudio enviado e processado com sucesso',
                data: {
                    originalName: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                    success: result.success,
                    transcription: result.transcription,
                    score: result.score,
                    processedAt: result.processedAt,
                    audioMessage: result.message,
                    pdf: pdfPath
                }
            };
        } catch (error) {
            throw new BadRequestException(`Erro ao processar áudio: ${error.message}`);
        }
    }

    @Get('history/:userId')
    async getHistory(@Param('userId') userId: string) {
        return this.consultationService.getHistoryForUser(userId);
    }
}