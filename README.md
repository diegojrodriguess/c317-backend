# 🎤 C317 Backend - API de Processamento de Áudio com IA

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

API desenvolvida com NestJS para upload e processamento de arquivos de áudio utilizando Inteligência Artificial para análise de pronúncia e transcrição.

## 🚀 Funcionalidades

- **Upload de Áudio**: Suporte para múltiplos formatos (MP3, WAV, OGG, M4A, FLAC)
- **Processamento IA**: Integração com Python para análise de áudio
- **Validação Robusta**: Verificação de tipo, tamanho e integridade dos arquivos
- **API RESTful**: Endpoints bem estruturados com TypeScript
- **Autenticação JWT**: Sistema de autenticação e autorização
- **MongoDB**: Persistência de dados com Mongoose

## 📁 Estrutura do Projeto

```
src/
├── audio/                    # 🎵 Módulo principal de áudio
│   ├── audio_controller.ts   # Controller com validações
│   ├── audio_service.ts      # Serviço de processamento
│   ├── audio.module.ts       # Módulo organizacional  
│   ├── config/
│   │   └── audio.config.ts   # Configurações centralizadas
│   └── dto/
│       └── audio-upload.dto.ts # Interfaces TypeScript
├── auth/                     # 🔐 Módulo de autenticação
├── users/                    # 👥 Módulo de usuários
├── config/                   # ⚙️ Configurações gerais
└── main.ts                   # 🚪 Ponto de entrada

ia/                          # 🤖 Scripts Python para IA
└── process_audio.py         # Script de processamento

uploads/                     # 📁 Arquivos enviados
test-audio.html             # 🧪 Interface de teste (ver seção de testes)
```

## 🔧 Arquivos de Teste Criados

### Interface Web de Teste (`test-audio.html`)
Interface HTML simples para testar upload de áudio sem precisar do Postman:
- Upload via drag & drop ou seleção de arquivo
- Visualização de resultados em tempo real
- Tratamento de erros amigável

### Configuração Simplificada para Testes
- `app-simple.module.ts`: Versão do AppModule sem MongoDB para testes rápidos
- Configuração de CORS habilitada para testes locais
- Logs informativos no console

## Description

Sistema backend para análise de pronúncia e processamento de áudio com IA, desenvolvido sobre o framework [NestJS](https://github.com/nestjs/nest).

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (v18 ou superior)
- Python 3.8+ (para processamento de IA)
- MongoDB (opcional, para funcionalidades completas)

### Instalação
```bash
npm install
```

### Configuração do Ambiente
1. Copie o arquivo `.env.example` para `.env`
2. Configure as variáveis de ambiente:
```env
JWT_SECRET=your-secret-key
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=admin
MONGO_PASS=password
MONGO_DB=c317
```

## 🚀 Executando o Projeto

### Modo Desenvolvimento (Recomendado)
```bash
npm run start:dev
```

### Modo Produção
```bash
npm run start:prod
```

### Modo Teste (Sem MongoDB)
Para testar apenas o módulo de áudio sem dependências do MongoDB:
```bash
# O arquivo main.ts já está configurado para usar app-simple.module.ts
npm run start:dev
```

## 🎤 API de Áudio

### Endpoint Principal
```http
POST /audio/upload
Content-Type: multipart/form-data

Body:
- audio: [arquivo de áudio]
```

### Formatos Suportados
- MP3 (audio/mpeg)
- WAV (audio/wav) 
- OGG (audio/ogg)
- M4A (audio/mp4)
- FLAC (audio/flac)

### Limites
- Tamanho máximo: 50MB por arquivo
- Tipos MIME validados automaticamente

### Resposta de Sucesso
```json
{
  "statusCode": 200,
  "message": "Áudio enviado e processado com sucesso",
  "data": {
    "originalName": "audio.mp3",
    "filename": "audio-1696248123456.mp3",
    "size": 1024000,
    "mimetype": "audio/mpeg",
    "success": true,
    "transcription": "Texto transcrito do áudio",
    "score": 85.5,
    "processedAt": "2025-10-02T16:56:51.789Z",
    "audioMessage": "Áudio processado com sucesso"
  }
}
```

## 🧪 Testando a API

### Método 1: Interface Web (Mais Fácil)
1. Certifique-se de que o servidor está rodando (`npm run start:dev`)
2. Abra o arquivo `test-audio.html` no seu navegador
3. Selecione um arquivo de áudio
4. Clique em "Enviar Áudio"
5. Veja o resultado na tela!

### Método 2: Postman
1. Método: `POST`
2. URL: `http://localhost:3000/audio/upload`
3. Body: `form-data`
4. Key: `audio` (tipo File)
5. Value: Selecione um arquivo de áudio

### Método 3: cURL
```bash
curl -X POST http://localhost:3000/audio/upload \
  -F "audio=@caminho/para/seu/arquivo.mp3"
```

### Método 4: JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

fetch('http://localhost:3000/audio/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🧪 Testes Automatizados

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 🐍 Configuração do Python para IA

O sistema utiliza Python para processamento de IA. O script está localizado em `ia/process_audio.py`.

### Testando o Script Python Isoladamente
```bash
python ia/process_audio.py "caminho/para/arquivo.mp3"
```

### Personalizando o Processamento
Edite o arquivo `ia/process_audio.py` para implementar sua lógica específica de:
- Transcrição de áudio
- Análise de pronúncia  
- Cálculo de scores
- Detecção de emoções
- Outras análises de IA

## 🔧 Troubleshooting

### Problema: Servidor não inicia
**Solução**: Use a configuração simplificada sem MongoDB:
- O arquivo `main.ts` já está configurado para usar `app-simple.module.ts`
- Execute `npm run start:dev` normalmente

### Problema: Erro no script Python
**Soluções**:
1. Verifique se o Python está instalado: `python --version`
2. Teste o script isoladamente: `python ia/process_audio.py`
3. Instale dependências Python se necessário

### Problema: Upload falha
**Verificações**:
- Arquivo é realmente de áudio?
- Tamanho menor que 50MB?
- Formato suportado (MP3, WAV, OGG, M4A, FLAC)?

### Logs do Desenvolvimento
O servidor em modo `start:dev` mostra logs detalhados:
- ✅ `AudioModule dependencies initialized` = Módulo carregado
- ✅ `Mapped {/audio/upload, POST} route` = Rota disponível
- ✅ `Nest application successfully started` = Servidor rodando

## 🏗️ Arquitetura

### Fluxo de Processamento de Áudio
1. **Upload** → Controller recebe arquivo via multipart/form-data
2. **Validação** → Verifica tipo, tamanho e integridade
3. **Armazenamento** → Salva arquivo na pasta `uploads/`
4. **Processamento IA** → Chama script Python via spawn
5. **Resposta** → Retorna JSON com metadados e análise

### Tecnologias Utilizadas
- **Backend**: NestJS + TypeScript
- **Validação**: Multer + Custom validators
- **IA**: Python (via child_process)
- **Banco**: MongoDB + Mongoose
- **Autenticação**: JWT + Passport
- **Testes**: Jest + interface HTML customizada

## 📦 Deployment

### Ambiente de Produção
Para deploy em produção:

1. Configure variáveis de ambiente
2. Instale dependências Python no servidor
3. Configure MongoDB
4. Execute: `npm run start:prod`

### Docker (Opcional)
O projeto inclui `docker-compose.yaml` para containerização.

## 📚 Recursos e Documentação

### Documentação do Projeto
- **AudioModule**: `src/audio/README.md` - Documentação específica do módulo de áudio
- **Configurações**: `src/audio/config/audio.config.ts` - Todas as configurações centralizadas
- **Interfaces**: `src/audio/dto/audio-upload.dto.ts` - Tipos TypeScript

### Arquivos de Teste Incluídos
- **Interface HTML**: `test-audio.html` - Teste interativo no navegador
- **Script Python**: `ia/process_audio.py` - Processamento de IA customizável
- **Config Simplificada**: `src/app-simple.module.ts` - Para testes sem MongoDB

### NestJS Resources
- [NestJS Documentation](https://docs.nestjs.com) - Documentação oficial
- [NestJS Discord](https://discord.gg/G7Qnnhy) - Comunidade para suporte

## 🚀 Status do Projeto

### ✅ Funcionalidades Implementadas
- Upload de múltiplos formatos de áudio
- Validação robusta de arquivos
- Integração com Python para IA
- API RESTful com TypeScript
- Sistema de configuração flexível
- Interface de teste incluída

### 🔧 Melhorias Futuras
- Autenticação completa com JWT
- Integração com banco de dados MongoDB
- Testes automatizados mais abrangentes
- Deploy com Docker
- Dashboard de administração

## 👥 Desenvolvimento

Este projeto foi desenvolvido como parte do sistema C317 para análise de pronúncia e processamento de áudio com Inteligência Artificial.

### Contribuindo
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 License

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**🎤 Desenvolvido para análise de pronúncia e processamento de áudio com IA**
