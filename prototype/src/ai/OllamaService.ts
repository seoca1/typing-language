/**
 * Ollama Service - AI 모델 연동 서비스
 *
 * Ollama 서버와 통신하여 AI 응답을 생성합니다.
 * qwen2.5:9b 모델을 기본으로 사용합니다.
 */

import { Ollama } from 'ollama';
import type { OllamaConfig, AIPrompt, AIResponse } from '../types.js';

export class OllamaService {
  private ollama: Ollama;
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      host: config.host || 'http://localhost:11434',
      model: config.model || 'qwen2.5:9b',
    };

    this.ollama = new Ollama({
      host: this.config.host,
    });
  }

  /**
   * Ollama 서버 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      const models = await this.ollama.list();
      console.log('Available models:', models);
      return true;
    } catch (error) {
      console.error('Ollama connection failed:', error);
      return false;
    }
  }

  /**
   * AI 프롬프트 생성 및 응답 받기
   */
  async generate(prompt: AIPrompt): Promise<AIResponse> {
    const startTime = performance.now();

    try {
      const response = await this.ollama.generate({
        model: this.config.model,
        prompt: prompt.user,
        system: prompt.system,
        stream: false,
      });

      const endTime = performance.now();

      return {
        text: response.response,
        generationTime: endTime - startTime,
        tokens: response.eval_count,
      };
    } catch (error) {
      const endTime = performance.now();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        text: '',
        generationTime: endTime - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * 스트리밍 방식으로 AI 응답 받기
   */
  async *generateStream(prompt: AIPrompt): AsyncGenerator<string> {
    try {
      const response = await this.ollama.generate({
        model: this.config.model,
        prompt: prompt.user,
        system: prompt.system,
        stream: true,
      });

      for await (const part of response) {
        yield part.response;
      }
    } catch (error) {
      console.error('Streaming generation failed:', error);
      throw error;
    }
  }

  /**
   * 대화형 채팅 (메시지 히스토리 유지)
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ): Promise<AIResponse> {
    const startTime = performance.now();

    try {
      const response = await this.ollama.chat({
        model: this.config.model,
        messages: messages,
        stream: false,
      });

      const endTime = performance.now();

      return {
        text: response.message.content,
        generationTime: endTime - startTime,
        tokens: response.eval_count,
      };
    } catch (error) {
      const endTime = performance.now();
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        text: '',
        generationTime: endTime - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * 사용 중인 모델 변경
   */
  setModel(model: string): void {
    this.config.model = model;
  }

  /**
   * 현재 설정 가져오기
   */
  getConfig(): OllamaConfig {
    return { ...this.config };
  }
}

// 싱글톤 인스턴스 (선택적)
let instance: OllamaService | null = null;

export function getOllamaService(config?: Partial<OllamaConfig>): OllamaService {
  if (!instance) {
    instance = new OllamaService(config);
  }
  return instance;
}
