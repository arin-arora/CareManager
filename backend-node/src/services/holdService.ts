import redis, { getRedisClient } from '../config/redis';

// Lua script to release slot hold atomically only if the owner matches
const RELEASE_SCRIPT = `
  if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
  else
    return 0
  end
`;

export const holdService = {
  getSlotKey: (doctorId: string, dateTime: string): string => {
    // Format dateTime to standard ISO string to keep keys consistent
    const dateStr = new Date(dateTime).toISOString();
    return `hold:doctor:${doctorId}:slot:${dateStr}`;
  },

  /**
   * Temporarily holds a slot for a patient.
   * If Redis is down, it returns true (gracefully allows booking to proceed to DB).
   */
  holdSlot: async (doctorId: string, dateTime: string, userId: string, ttlMs: number = 300000): Promise<boolean> => {
    const client = getRedisClient();
    if (!client) {
      console.warn('⚠ Redis is unavailable. Bypassing slot hold check.');
      return true; // Fallback: allow to proceed
    }

    try {
      const key = holdService.getSlotKey(doctorId, dateTime);
      const result = await (client as any).set(key, userId, 'PX', ttlMs, 'NX');
      return result === 'OK';
    } catch (err: any) {
      console.error('Error holding slot in Redis:', err.message);
      return true; // Fallback: allow to proceed
    }
  },

  /**
   * Releases a slot hold. Ensures only the owner who held it can release it.
   */
  releaseSlot: async (doctorId: string, dateTime: string, userId: string): Promise<boolean> => {
    const client = getRedisClient();
    if (!client) return true;

    try {
      const key = holdService.getSlotKey(doctorId, dateTime);
      const result = await client.eval(RELEASE_SCRIPT, 1, key, userId);
      return result === 1;
    } catch (err: any) {
      console.error('Error releasing slot in Redis:', err.message);
      return true;
    }
  },

  /**
   * Checks who holds the slot. Returns userId or null if free.
   */
  checkHold: async (doctorId: string, dateTime: string): Promise<string | null> => {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const key = holdService.getSlotKey(doctorId, dateTime);
      return await client.get(key);
    } catch (err: any) {
      console.error('Error checking hold in Redis:', err.message);
      return null;
    }
  }
};
