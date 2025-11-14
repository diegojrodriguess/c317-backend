import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { audioConfig } from './config/audio.config';

interface AudioProcessResult {
  success: boolean;
  transcription?: string;
  score?: number;
  message?: string;
  processedAt: string;
  // Campos adicionais que podem vir do processamento IA
  errors?: string[];
  suggestions?: string[];
  highlights?: any;
}

@Injectable()
export class AudioService {
  async processAudio(filePath: string, options?: { targetWord?: string, provider?: string, userId?: string }): Promise<AudioProcessResult> {
    return new Promise((resolve, reject) => {
      try {
        // Verificar se o arquivo existe
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
          return reject('Arquivo de áudio não encontrado');
        }

  // Caminho para o script Python (configurável via audioConfig)
  const configuredScript = path.resolve(path.join(process.cwd(), audioConfig.pythonScriptPath));
  const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';

  // Build args: script, file, [target_word, provider]
  const args = [configuredScript, filePath];
  if (options?.targetWord) args.push(options.targetWord);
  if (options?.provider) args.push(options.provider);

  // Chamar script Python na pasta `ia/` usando executável configurável
  const pythonProcess = spawn(pythonExecutable, args);

      let result = '';
      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const parsedResult = JSON.parse(result || '{}');
            resolve({
              success: true,
              transcription: parsedResult.transcription,
              score: parsedResult.score,
              message: parsedResult.message || 'Áudio processado com sucesso',
              processedAt: new Date().toISOString(),
              // repassar campos opcionais se existirem
              errors: parsedResult.errors || [],
              suggestions: parsedResult.suggestions || [],
              highlights: parsedResult.highlights || {}
            });
          } catch (parseError) {
            reject(`Erro ao parsear resultado do Python: ${parseError.message}`);
          }
        } else {
          reject(`Erro no processamento do áudio. Código: ${code}`);
        }
      });

      // Tratar erro de spawn
      pythonProcess.on('error', (error) => {
        reject(`Erro ao executar script Python: ${error.message}`);
      });
      
    } catch (error) {
      reject(`Erro geral no processamento: ${error.message}`);
    }
    });
  }
}
