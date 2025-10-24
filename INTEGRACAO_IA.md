# 🔗 Guia de Integração: Backend NestJS ↔ API FastAPI

## 📋 Arquitetura da Integração

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│   Frontend      │   HTTP  │  NestJS Backend  │  HTTP   │   FastAPI (IA)     │
│   (React/etc)   │ ──────> │   (Port 3000)    │ ──────> │   (Port 8000)      │
│                 │         │                  │         │                     │
│ - Upload áudio  │         │ - Recebe áudio   │         │ - Transcreve       │
│ - Mostra score  │         │ - Chama IA       │         │ - Avalia IA        │
│ - Feedback      │         │ - Retorna result │         │ - Retorna feedback │
└─────────────────┘         └──────────────────┘         └─────────────────────┘
                                     │
                                     │ spawn()
                                     ↓
                            ┌─────────────────────┐
                            │ process_audio.py    │
                            │ (Ponte HTTP)        │
                            └─────────────────────┘
```

## 🚀 Como Funciona

### 1. **Frontend → NestJS**
```typescript
POST /audio/upload
Content-Type: multipart/form-data

{
  audio: <arquivo.wav>
}
```

### 2. **NestJS → process_audio.py**
```typescript
// audio_service.ts
const pythonProcess = spawn('python', [
  'ia/process_audio.py',
  filePath,
  'target_word',  // Opcional
  'whisper'       // Opcional: whisper | openai | gemini
]);
```

### 3. **process_audio.py → FastAPI**
```python
POST http://localhost:8000/avaliar
Content-Type: multipart/form-data

{
  audio: <arquivo.wav>,
  target_word: "Hello",
  user_id: "user123",
  provider: "whisper",
  ai_scoring: true,
  scoring_provider: "gemini",
  language: "en-US"
}
```

### 4. **FastAPI → process_audio.py → NestJS → Frontend**
```json
{
  "success": true,
  "transcription": "Hello",
  "score": 100,
  "message": "Excellent pronunciation! Perfect match...",
  "method": "ai-gemini",
  "match": true,
  "errors": [],
  "suggestions": ["Keep up the great work!"]
}
```

---

## 📦 Configuração Necessária

### **Passo 1: Certifique-se que a API FastAPI está rodando**

```powershell
# Terminal 1 - Iniciar API FastAPI
cd c:\Users\vish8\OneDrive\Desktop\p8\C317\c317---IA
.\.venv\Scripts\Activate.ps1
cd pronuncia-ia
$env:PYTHONIOENCODING="utf-8"
python start_server.py

# Aguarde ver:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

### **Passo 2: Iniciar Backend NestJS**

```powershell
# Terminal 2 - Iniciar NestJS
cd c:\Users\vish8\OneDrive\Desktop\p8\C317\c317-backend
npm run start:dev

# Aguarde ver:
# [Nest] Application successfully started
```

### **Passo 3: Testar Integração**

```powershell
# Terminal 3 - Testar upload de áudio
curl -X POST http://localhost:3000/audio/upload `
  -F "audio=@caminho/para/seu/audio.wav"
```

---

## 🔧 Modificações Necessárias no NestJS

### **Atualizar `audio_service.ts`** (Opcional - Melhorias)

Se quiser passar a palavra-alvo e configurações:

```typescript
async processAudio(
  filePath: string,
  targetWord: string = 'Hello',  // NOVO
  provider: string = 'whisper'    // NOVO
): Promise<AudioProcessResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../ia/process_audio.py');
    
    // Passar parâmetros adicionais
    const pythonProcess = spawn('python', [
      scriptPath, 
      filePath,
      targetWord,  // NOVO
      provider     // NOVO
    ]);
    
    // ... resto do código igual
  });
}
```

### **Atualizar `audio_controller.ts`** (Opcional)

Para aceitar palavra-alvo:

```typescript
@Post('upload')
async uploadAudio(
  @UploadedFile() file: any,
  @Body('targetWord') targetWord?: string,        // NOVO
  @Body('provider') provider?: string             // NOVO
): Promise<AudioUploadResponse> {
  // ...
  const result = await this.audioService.processAudio(
    file.path,
    targetWord || 'Hello',    // NOVO
    provider || 'whisper'     // NOVO
  );
  // ...
}
```

---

## 🧪 Testes de Integração

### **Teste 1: Verificar se APIs estão rodando**

```powershell
# Testar FastAPI
curl http://localhost:8000

# Testar NestJS
curl http://localhost:3000
```

### **Teste 2: Upload de áudio simples**

```powershell
# Criar arquivo de teste
cd c:\Users\vish8\OneDrive\Desktop\p8\C317\c317-backend

# Usar áudio de exemplo (se tiver)
curl -X POST http://localhost:3000/audio/upload `
  -F "audio=@uploads/test-audio.wav"
```

### **Teste 3: Verificar resposta completa**

```powershell
curl -X POST http://localhost:3000/audio/upload `
  -F "audio=@test.wav" `
  -F "targetWord=Hello" `
  -F "provider=whisper"
```

---

## 📊 Formato de Resposta Esperado

### **Sucesso (com IA Gemini):**
```json
{
  "statusCode": 200,
  "message": "Áudio enviado e processado com sucesso",
  "data": {
    "originalName": "audio.wav",
    "filename": "audio-1234567890-123456789.wav",
    "size": 156234,
    "mimetype": "audio/wav",
    "success": true,
    "transcription": "Hello how are you",
    "score": 95,
    "processedAt": "2025-10-23T12:34:56.789Z",
    "audioMessage": "Very good! Your pronunciation was clear for most words..."
  }
}
```

### **Erro (API não rodando):**
```json
{
  "statusCode": 400,
  "message": "Erro ao processar áudio: Não foi possível conectar à API de IA...",
  "error": "Bad Request"
}
```

---

## ⚙️ Variáveis de Configuração

### **No FastAPI (.env)**
```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
DEFAULT_PROVIDER=gemini
DEFAULT_LANGUAGE=pt-BR
```

### **No NestJS (opcional - .env)**
```env
IA_API_URL=http://localhost:8000
IA_API_TIMEOUT=30000
DEFAULT_TARGET_WORD=Hello
DEFAULT_PROVIDER=whisper
```

---

## 🐛 Solução de Problemas

### **Problema 1: "Não foi possível conectar à API de IA"**
```
Solução: Certifique-se que FastAPI está rodando:
  cd c317---IA/pronuncia-ia
  python start_server.py
```

### **Problema 2: "ModuleNotFoundError: No module named 'requests'"**
```
Solução: Instalar requests no backend:
  cd c317-backend/ia
  pip install requests
```

### **Problema 3: "Process exited with code 1"**
```
Solução: Testar process_audio.py manualmente:
  cd c317-backend/ia
  python process_audio.py ../uploads/test.wav
  
  Se retornar erro, verificar:
  1. API FastAPI está rodando? (http://localhost:8000)
  2. Arquivo de áudio existe?
  3. Python tem permissão para ler o arquivo?
```

### **Problema 4: Áudio não é processado**
```
Solução: Verificar formato do áudio
  - Formatos suportados: .wav, .mp3, .opus, .ogg
  - Tamanho máximo: verificar audioConfig
  - Taxa de amostragem recomendada: 16kHz ou 44.1kHz
```

---

## 📈 Próximos Passos (Melhorias Futuras)

1. **✅ Substituir `spawn()` por chamada HTTP direta** (mais eficiente)
   ```typescript
   // Ao invés de spawn Python, fazer:
   const response = await axios.post('http://localhost:8000/avaliar', formData);
   ```

2. **✅ Adicionar cache de resultados** (evitar reprocessar mesmo áudio)

3. **✅ Implementar fila de processamento** (para muitos uploads simultâneos)

4. **✅ Adicionar WebSocket** (feedback em tempo real)

5. **✅ Métricas e logging** (monitorar performance)

---

## 📞 Checklist de Deploy

- [ ] API FastAPI rodando na porta 8000
- [ ] Backend NestJS rodando na porta 3000
- [ ] Arquivo `.env` configurado com chaves API
- [ ] Dependências instaladas (requests, etc)
- [ ] Pasta `uploads/` existe e tem permissões
- [ ] Teste de integração funcionando
- [ ] Logs configurados para debug

---

## ✅ Status da Integração

| Componente | Status | Observações |
|------------|--------|-------------|
| FastAPI (IA) | ✅ Funcionando | Porta 8000, endpoints OK |
| NestJS (Backend) | ✅ Pronto | Porta 3000, precisa iniciar |
| process_audio.py | ✅ Atualizado | Faz chamada HTTP para FastAPI |
| Integração | ⚠️ Testar | Rodar ambos servidores e testar |
| Frontend | ⏳ Pendente | Aguardando integração |

---

## 🎯 Resumo Para Seu Amigo (Backend)

**"Oi! Atualizei a integração. Agora funciona assim:"**

1. **Iniciar a API de IA primeiro:**
   ```bash
   cd ../c317---IA/pronuncia-ia
   python start_server.py
   ```

2. **Depois iniciar o NestJS:**
   ```bash
   npm run start:dev
   ```

3. **O fluxo agora é:**
   - NestJS recebe upload → chama `process_audio.py` → faz HTTP para FastAPI → FastAPI processa com IA → retorna resultado

4. **Mudanças no código:**
   - `process_audio.py` foi 100% reescrito
   - Agora faz chamada HTTP ao invés de processar localmente
   - Retorna mesmo formato JSON, então seu código no NestJS **não precisa mudar nada!**

5. **Para testar:**
   ```bash
   curl -X POST http://localhost:3000/audio/upload -F "audio=@test.wav"
   ```

**Qualquer dúvida, me chama!** 🚀
