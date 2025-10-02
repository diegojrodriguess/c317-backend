import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

interface AudioProcessResult {
  success: boolean;
  transcription?: string;
  score?: number;
  message?: string;
  processedAt: string;
}

@Injectable()
export class AudioService {
  async processAudio(filePath: string): Promise<AudioProcessResult> {
    return new Promise((resolve, reject) => {
      try {
        // Verificar se o arquivo existe
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
          return reject('Arquivo de áudio não encontrado');
        }

        // Caminho para o script Python
        const scriptPath = path.join(__dirname, '../../ia/process_audio.py');
        
        // Chamar script Python na pasta `ia/`
        const pythonProcess = spawn('python', [scriptPath, filePath]);

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
            const parsedResult = JSON.parse(result);
            resolve({
              success: true,
              transcription: parsedResult.transcription,
              score: parsedResult.score,
              message: parsedResult.message || 'Áudio processado com sucesso',
              processedAt: new Date().toISOString()
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
