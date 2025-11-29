import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios before importing the API service
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  };
  
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance)
    }
  };
});

// Now import the service after mocking
const apiModule = await import('../services/api.js');
const api = apiModule.default;
const aiDermatologyService = apiModule.aiDermatologyService;

describe('API Service', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('AI Dermatology Service', () => {
    let mockPost;

    beforeEach(() => {
      mockPost = vi.fn();
      vi.spyOn(api, 'post').mockImplementation(mockPost);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('chat', () => {
      it('should send chat message with conversation history', async () => {
        const mockResponse = {
          data: {
            response: 'AI response',
            conversationId: '123'
          }
        };
        mockPost.mockResolvedValue(mockResponse);

        const message = 'What is acne?';
        const conversationHistory = [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi, how can I help?' }
        ];

        const result = await aiDermatologyService.chat(message, conversationHistory);

        expect(mockPost).toHaveBeenCalledWith('/api/ai-dermatology-expert/chat', {
          message,
          conversationHistory
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should use empty conversation history if not provided', async () => {
        const mockResponse = { data: { response: 'AI response' } };
        mockPost.mockResolvedValue(mockResponse);

        await aiDermatologyService.chat('Test message');

        expect(mockPost).toHaveBeenCalledWith('/api/ai-dermatology-expert/chat', {
          message: 'Test message',
          conversationHistory: []
        });
      });

      it('should handle API errors', async () => {
        mockPost.mockRejectedValue(new Error('Network error'));

        await expect(
          aiDermatologyService.chat('Test message')
        ).rejects.toThrow('Network error');
      });
    });

    describe('analyzeSkinImage', () => {
      it('should send image file with message for analysis', async () => {
        const mockResponse = {
          data: {
            analysis: 'Skin condition detected',
            confidence: 0.95
          }
        };
        mockPost.mockResolvedValue(mockResponse);

        const mockFile = new File(['image data'], 'skin.jpg', { type: 'image/jpeg' });
        const message = 'Analyze this rash';
        const conversationHistory = [];

        const result = await aiDermatologyService.analyzeSkinImage(
          mockFile,
          message,
          conversationHistory
        );

        expect(mockPost).toHaveBeenCalledWith(
          '/api/ai-dermatology-expert/analyze-skin',
          expect.any(FormData),
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        expect(result).toEqual(mockResponse.data);
      });

      it('should use default message if not provided', async () => {
        const mockResponse = { data: { analysis: 'Analysis result' } };
        mockPost.mockResolvedValue(mockResponse);

        const mockFile = new File(['image data'], 'skin.jpg', { type: 'image/jpeg' });

        await aiDermatologyService.analyzeSkinImage(mockFile);

        expect(mockPost).toHaveBeenCalledWith(
          '/api/ai-dermatology-expert/analyze-skin',
          expect.any(FormData),
          expect.any(Object)
        );
      });
    });

    describe('transcribeAudio', () => {
      it('should send audio file for transcription', async () => {
        const mockResponse = {
          data: {
            transcription: 'Transcribed text',
            language: 'en'
          }
        };
        mockPost.mockResolvedValue(mockResponse);

        const mockAudioFile = new File(['audio data'], 'recording.wav', { type: 'audio/wav' });

        const result = await aiDermatologyService.transcribeAudio(mockAudioFile);

        expect(mockPost).toHaveBeenCalledWith(
          '/api/ai-dermatology-expert/transcribe',
          expect.any(FormData),
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle transcription errors', async () => {
        mockPost.mockRejectedValue(new Error('Transcription failed'));

        const mockAudioFile = new File(['audio data'], 'recording.wav', { type: 'audio/wav' });

        await expect(
          aiDermatologyService.transcribeAudio(mockAudioFile)
        ).rejects.toThrow('Transcription failed');
      });
    });

    describe('textToSpeech', () => {
      it('should convert text to speech', async () => {
        const mockResponse = {
          data: {
            audioUrl: 'https://example.com/audio.mp3',
            duration: 5.2
          }
        };
        mockPost.mockResolvedValue(mockResponse);

        const text = 'Hello, this is a test';

        const result = await aiDermatologyService.textToSpeech(text);

        expect(mockPost).toHaveBeenCalledWith('/api/ai-dermatology-expert/text-to-speech', {
          text
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle text-to-speech errors', async () => {
        mockPost.mockRejectedValue(new Error('TTS failed'));

        await expect(
          aiDermatologyService.textToSpeech('Test text')
        ).rejects.toThrow('TTS failed');
      });
    });
  });
});