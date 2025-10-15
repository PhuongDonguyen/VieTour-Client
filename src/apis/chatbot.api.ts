import axiosInstance from './axiosInstance';

// Interface for tour data in chatbot response
export interface ChatbotTour {
  tour_id: number;
  name: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  similarity: number;
  poster_url: string;
  slug: string;
}

// Add history interface
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Update the request interface to include history
export interface ChatbotRequest {
  query: string;
  history?: ChatMessage[];
}

// Interface for chatbot response data
export interface ChatbotResponseData {
  success: boolean;
  query: string;
  response: string;
  tours: ChatbotTour[];
}

// Interface for the full API response
export interface ChatbotApiResponse {
  success: boolean;
  response: ChatbotResponseData;
}

// Streaming types
export interface StreamingMetadata {
  type: 'metadata';
  success: boolean;
  query: string;
  cleanedQuery: string;
  filters: any;
  tours: ChatbotTour[];
  tourCount: number;
}

export interface StreamingChunk {
  type: 'response_chunk';
  content: string;
}

export interface StreamingComplete {
  type: 'completed';
}

export interface StreamingError {
  type: 'error';
  success: false;
  query: string;
  message: string;
  error: string;
}

export type StreamingMessage = StreamingMetadata | StreamingChunk | StreamingComplete | StreamingError;

// Non-streaming chatbot API function (backward compatibility)
export const sendChatbotMessage = (data: ChatbotRequest) =>
  axiosInstance.post<ChatbotApiResponse>('/api/chatbot', data);

// Streaming chatbot API function
export const sendChatbotMessageStream = async function* (
  data: ChatbotRequest
): AsyncGenerator<StreamingMessage, void, unknown> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;

        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data as StreamingMessage;
          } catch (e) {
            console.error('Error parsing streaming data:', e);
          }
        }
      }
    }
  } catch (error) {
    yield {
      type: 'error',
      success: false,
      query: data.query,
      message: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as StreamingError;
  }
};

// Streaming chatbot API function with AbortController support
export const sendChatbotMessageStreamWithAbort = async function* (
  data: ChatbotRequest,
  abortController?: AbortController
): AsyncGenerator<StreamingMessage, void, unknown> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;

        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data as StreamingMessage;
          } catch (e) {
            console.error('Error parsing streaming data:', e);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was aborted');
      return;
    }

    yield {
      type: 'error',
      success: false,
      query: data.query,
      message: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as StreamingError;
  }
};