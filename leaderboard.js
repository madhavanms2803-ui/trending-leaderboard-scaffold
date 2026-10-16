import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);
const keyFor = (id) => `${id}:meta`;

export async function upvote(postId) {
  return redis.zincrby("trending:posts", 1, postId);
}

export async function getTop(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new TypeError("n must be a positive integer");
  }

  const flat = await redis.zrevrange(
    "trending:posts", 0, n - 1, "WITHSCORES"
  );

  const rows = [];
  const pipeline = redis.pipeline();

  for (let i = 0; i < flat.length; i += 2) {
    const id = flat[i];
    rows.push({ id, score: Number(flat[i + 1]) });
    pipeline.hgetall(keyFor(id));
  }

  if (rows.length === 0) return [];

  const results = await pipeline.exec();

  return rows.map((row, i) => {
    const [error, metadata] = results[i];
    if (error) throw error;
    return { ...row, ...metadata };
  });
}

export { redis };
