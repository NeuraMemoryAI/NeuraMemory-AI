export {
  registerService,
  loginService,
  generateApiService,
  getUserById,
  getUserByApiKey,
} from './auth.service.js';

export {
  processPlainText,
  processDocument,
  processLink,
  getUserMemories,
  semanticSearch,
  clearUserMemories,
  deleteUserMemoryById,
  getMemoryStats,
  getMemoryPointById,
  updateMemoryById,
} from './memory.service.js';

export { streamChatResponse } from './chat.service.js';

export {
  createMcpServer,
  getTransport,
  setTransport,
  removeTransport,
  resolveUserFromRequest,
} from './mcp.service.js';
