import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { audioConfig } from './config/audio.config';
import axios from 'axios';
import * as fs from 'fs';
import FormData = require('form-data');

interface AudioProcessResult {
  success: boolean;
  transcription?: string;
  score?: number;
  message?: string;
  match?: boolean;
  evaluation?: string;
  processedAt: string;
  // Campos adicionais que podem vir do processamento IA
  errors?: string[];
  suggestions?: string[];
  highlights?: any;
}

@Injectable()
export class AudioService {
  async processAudio(filePath: string, options?: { targetWord?: string, provider?: string, userId?: string }): Promise<AudioProcessResult> {
    // Prefer direct HTTP integration with IA service; fallback to Python bridge if env forces it
    const usePyBridge = String(process.env.USE_PY_BRIDGE || '').toLowerCase() === 'true';

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo de áudio não encontrado');
    }

    if (!usePyBridge) {
      const IA_API_URL = process.env.IA_API_URL || process.env.API_BASE_URL || 'http://localhost:8000';
      const endpoint = new URL('/avaliar', IA_API_URL).toString();

      const form = new FormData();
      form.append('audio', fs.createReadStream(filePath));
      if (options?.userId) form.append('user_id', options.userId);
      if (options?.targetWord) form.append('target_word', options.targetWord);
      form.append('provider', options?.provider || 'gemini');
      form.append('ai_scoring', 'true');
      form.append('scoring_provider', 'gemini');
      form.append('language', 'português');

      const headers = form.getHeaders();
      try {
        const resp = await axios.post(endpoint, form, { headers, timeout: audioConfig.processingTimeout });
        const data = resp.data || {};
        return {
          success: true,
          transcription: data.predicted || data.transcription || '',
          score: typeof data.score === 'number' ? data.score : 0,
          message: data.feedback || 'Áudio processado com sucesso',
          match: typeof data.match !== 'undefined' ? Boolean(data.match) : undefined,
          evaluation: data.evaluation || data.assessment || undefined,
          processedAt: new Date().toISOString(),
          errors: data.errors || [],
          suggestions: data.suggestions || [],
          highlights: data.highlights || {},
        };
      } catch (err: any) {
        const status = err?.response?.status;
        const body = err?.response?.data;
        const details = typeof body === 'object' ? JSON.stringify(body) : String(body || err.message);
        throw new Error(`Falha ao chamar IA (/avaliar) [${status ?? 'no-status'}]: ${details}`);
      }
    }

    // Python bridge fallback (kept for compatibility)
    return await new Promise<AudioProcessResult>((resolve, reject) => {
      try {
        const { spawn } = require('child_process');
        const configuredScript = path.resolve(path.join(process.cwd(), audioConfig.pythonScriptPath));
        const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';
        const args = [configuredScript, filePath];
        if (options?.targetWord) args.push(options.targetWord);
        if (options?.provider) args.push(options.provider);

        const pythonProcess = spawn(pythonExecutable, args);
        let result = '';
        pythonProcess.stdout.on('data', (data) => { result += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { console.error(data.toString()); });
        pythonProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const parsedResult = JSON.parse(result || '{}');
              resolve({
                success: true,
                transcription: parsedResult.transcription,
                score: parsedResult.score,
                message: parsedResult.message || 'Áudio processado com sucesso',
                match: typeof parsedResult.match !== 'undefined' ? Boolean(parsedResult.match) : undefined,
                evaluation: parsedResult.evaluation || parsedResult.assessment || undefined,
                processedAt: new Date().toISOString(),
                errors: parsedResult.errors || [],
                suggestions: parsedResult.suggestions || [],
                highlights: parsedResult.highlights || {},
              });
            } catch (parseError: any) {
              reject(`Erro ao parsear resultado do Python: ${parseError.message}`);
            }
          } else {
            reject(`Erro no processamento do áudio. Código: ${code}`);
          }
        });
        pythonProcess.on('error', (error: any) => { reject(`Erro ao executar script Python: ${error.message}`); });
      } catch (error: any) {
        reject(`Erro geral no processamento: ${error.message}`);
      }
    });
  }
}
