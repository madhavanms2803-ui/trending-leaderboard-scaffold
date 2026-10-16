import assert from "node:assert/strict";
import { upvote, getTop, redis } from "./leaderboard.js";

async function test() {
  const target = "post:100";

  // Seed must have run first. Fifty atomic upvotes push
  // this post above every initial score (0–49).
  for (let i = 0; i < 50; i++) {
    await upvote(target);
  }

  const top = await getTop(10);

  console.log("Top 10:");
  top.forEach((post, i) => {
    console.log(
      `  #${i + 1}  ${post.id}  score=${post.score}  ` +
      `${post.title} (${post.author})`
    );
  });

  assert.ok(
    top.some((post) => post.id === target),
    `${target} should reach the top 10`
  );

  console.log(`PASS ✅  ${target} reached the top 10`);
}

test()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => redis.quit());
