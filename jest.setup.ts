import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// Polyfill setImmediate for Prisma (IMPORTANT!)
global.setImmediate = global.setImmediate || ((fn: unknown, ...args: unknown[]) => global.setTimeout(fn as TimerHandler, 0, ...args));

// Polyfill Next.js Request/Response for Jest
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock Next.js Request and Response
class MockRequest {
  url: string;
  method: string;
  headers: Map<string, string>;
  private _body: string;

  constructor(input: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
    this.url = input;
    this.method = init?.method || 'GET';
    this.headers = new Map(Object.entries(init?.headers || {}));
    this._body = init?.body || '';
  }

  async json() {
    return JSON.parse(this._body);
  }
}

class MockResponse {
  body: string;
  status: number;
  headers: Map<string, string>;

  constructor(body: string, init?: { status?: number; headers?: Record<string, string> }) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async json() {
    return JSON.parse(this.body);
  }

  // Static method for NextResponse.json()
  static json(data: unknown, init?: { status?: number; headers?: Record<string, string> }) {
    return new MockResponse(JSON.stringify(data), init);
  }
}

global.Request = MockRequest as unknown as typeof Request;
global.Response = MockResponse as unknown as typeof Response;