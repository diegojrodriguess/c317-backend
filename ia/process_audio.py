#!/usr/bin/env python3
"""
Script de integração entre NestJS e FastAPI de Avaliação de Pronúncia

Este script serve como ponte entre o backend NestJS e a API de IA (FastAPI).
Recebe o caminho do áudio e faz uma chamada HTTP para a API de avaliação.

IMPORTANTE: Certifique-se que a API FastAPI está rodando em http://localhost:8000
Para iniciar a API: cd c317---IA/pronuncia-ia && python start_server.py
"""
import sys
import json
import os
import requests

# Configurações da API (podem ser sobrescritas por variável de ambiente)
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
API_AVALIAR_ENDPOINT = f"{API_BASE_URL}/avaliar"
API_TRANSCREVER_ENDPOINT = f"{API_BASE_URL}/transcrever"

# Configurações padrão
DEFAULT_TARGET_WORD = "Hello"  # Palavra padrão caso não seja fornecida
DEFAULT_PROVIDER = "whisper"  # whisper (local/grátis) | openai | gemini
DEFAULT_AI_SCORING = True  # Usar IA para avaliação?
DEFAULT_SCORING_PROVIDER = "gemini"  # gemini (grátis) | openai
DEFAULT_LANGUAGE = "en-US"  # Idioma para contextualização


def check_api_status():
    """Verifica se a API FastAPI está rodando"""
    try:
        response = requests.get(API_BASE_URL, timeout=2)
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False
    except requests.exceptions.Timeout:
        return False


def transcribe_audio(file_path, provider=DEFAULT_PROVIDER):
    """
    Apenas transcreve o áudio (sem avaliação)
    Útil para obter o que foi dito sem avaliar pronúncia
    """
    try:
        with open(file_path, 'rb') as audio_file:
            files = {'audio': audio_file}
            data = {'provider': provider}
            
            response = requests.post(
                API_TRANSCREVER_ENDPOINT,
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "success": False,
                    "message": f"Erro na transcrição: HTTP {response.status_code}",
                    "details": response.text
                }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Erro ao conectar com API: {str(e)}"
        }


def evaluate_pronunciation(
    file_path, 
    target_word=DEFAULT_TARGET_WORD,
    user_id="default_user",
    provider=DEFAULT_PROVIDER,
    ai_scoring=DEFAULT_AI_SCORING,
    scoring_provider=DEFAULT_SCORING_PROVIDER,
    language=DEFAULT_LANGUAGE
):
    """
    Avalia a pronúncia do áudio comparando com a palavra-alvo
    
    Args:
        file_path: Caminho do arquivo de áudio
        target_word: Palavra/frase que deveria ser falada
        user_id: ID do usuário (opcional)
        provider: Modelo para transcrição (whisper, openai, gemini)
        ai_scoring: Se True, usa IA para avaliar (recomendado!)
        scoring_provider: Qual IA usar (gemini=grátis, openai=pago)
        language: Idioma (en-US, pt-BR, etc)
    
    Returns:
        Dict com score, feedback, suggestions, etc
    """
    try:
        # Verificar se arquivo existe
        if not os.path.exists(file_path):
            return {
                "success": False,
                "message": f"Arquivo não encontrado: {file_path}"
            }
        
        # Preparar dados para envio
        with open(file_path, 'rb') as audio_file:
            files = {'audio': audio_file}
            data = {
                'user_id': user_id,
                'target_word': target_word,
                'provider': provider,
                'ai_scoring': str(ai_scoring).lower(),  # Converter para string
                'scoring_provider': scoring_provider,
                'language': language
            }
            
            # Fazer requisição para API
            response = requests.post(
                API_AVALIAR_ENDPOINT,
                files=files,
                data=data,
                timeout=30  # Timeout de 30 segundos
            )
            
            # Processar resposta
            if response.status_code == 200:
                api_result = response.json()
                
                # Formatar resultado para o formato esperado pelo NestJS
                return {
                    "success": True,
                    "transcription": api_result.get("predicted", ""),
                    "score": api_result.get("score", 0),
                    "message": api_result.get("feedback", "Áudio processado com sucesso"),
                    "method": api_result.get("method", "unknown"),
                    "match": api_result.get("match", False),
                    "errors": api_result.get("errors", []),
                    "suggestions": api_result.get("suggestions", []),
                    "details": api_result  # Incluir resposta completa da API
                }
            else:
                return {
                    "success": False,
                    "message": f"Erro na API de avaliação: HTTP {response.status_code}",
                    "details": response.text
                }
    
    except requests.exceptions.ConnectionError:
        return {
            "success": False,
            "message": "Não foi possível conectar à API de IA. Certifique-se que está rodando em http://localhost:8000"
        }
    
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "message": "Timeout ao processar áudio. A API pode estar sobrecarregada."
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Erro no processamento: {str(e)}"
        }


def main():
    """
    Função principal - chamada pelo NestJS
    
    Uso: python process_audio.py <arquivo_audio> [target_word] [provider]
    
    Exemplos:
        python process_audio.py audio.wav
        python process_audio.py audio.wav "Hello world"
        python process_audio.py audio.wav "Olá" whisper
    """
    # Validar argumentos
    if len(sys.argv) < 2:
        error_result = {
            "success": False,
            "message": "Uso: python process_audio.py <arquivo_audio> [target_word] [provider]"
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)
    
    # Extrair argumentos
    file_path = sys.argv[1]
    target_word = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_TARGET_WORD
    provider = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_PROVIDER
    
    # Verificar se API está rodando
    if not check_api_status():
        error_result = {
            "success": False,
            "message": "⚠️ API de IA não está rodando! Inicie com: cd c317---IA/pronuncia-ia && python start_server.py"
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)
    
    # Processar áudio
    result = evaluate_pronunciation(
        file_path=file_path,
        target_word=target_word,
        provider=provider
    )
    
    # Retornar resultado como JSON
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
