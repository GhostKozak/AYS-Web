const QUEUE_KEY = "offline_req_queue";
const MAX_QUEUE_SIZE = 50;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface QueuedRequest {
  id: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  data?: unknown;
  timestamp: number;
  userId?: string;
}

export const getQueue = (): QueuedRequest[] => {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const valid = parsed.filter(
      (item): item is QueuedRequest =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as QueuedRequest).id === "string" &&
        typeof (item as QueuedRequest).method === "string" &&
        typeof (item as QueuedRequest).url === "string" &&
        typeof (item as QueuedRequest).timestamp === "number" &&
        now - (item as QueuedRequest).timestamp < TTL_MS,
    );
    if (valid.length !== parsed.length) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
};

export const addToQueue = (
  method: QueuedRequest["method"],
  url: string,
  data?: unknown,
  userId?: string,
): void => {
  const queue = getQueue();
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift(); // Drop oldest to stay within limit
  }
  queue.push({
    id: crypto.randomUUID(),
    method,
    url,
    data,
    timestamp: Date.now(),
    userId,
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const removeFromQueue = (id: string): void => {
  const queue = getQueue().filter((r) => r.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const clearQueue = (): void => {
  localStorage.removeItem(QUEUE_KEY);
};

export const queueSize = (): number => getQueue().length;
