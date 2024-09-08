import { MiftahDB } from "miftahdb";

const queryCount = 100000; // Number of queries to benchmark

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

function formatTime(ms) {
  return (ms / 1000).toFixed(2);
}

function benchmark(db, operation, keys, action) {
  console.log(`\n* Benchmark ${operation}`);

  let totalLatency = 0;
  const start = performance.now();

  for (const key of keys) {
    const latencyStart = performance.now();
    action(db, key);
    totalLatency += performance.now() - latencyStart;
  }

  const duration = performance.now() - start;
  console.log(`${queryCount} queries took: ${formatTime(duration)} seconds`);
  console.log(
    `Average latency: ${(totalLatency / queryCount).toFixed(4)} milliseconds`
  );
}

function main() {
  console.log(`Starting benchmark with ${queryCount} queries...`);
  const db = new MiftahDB("benchmark.db");

  const keys = Array.from({ length: queryCount }, () => randomString(10));
  const keyPairs = keys.map((key) => [key, randomString(50)]);

  benchmark(db, "Set", keyPairs, (db, [key, value]) => db.set(key, value));
  benchmark(db, "Set Expire", keys, (db, key) =>
    db.setExpire(key, new Date("2025-01-12"))
  );

  benchmark(db, "Exists", keys, (db, key) => db.exists(key));

  benchmark(db, "Get", keys, (db, key) => db.get(key));
  benchmark(db, "Get Expire", keys, (db, key) => db.getExpire(key));

  benchmark(db, "delete", keys, (db, key) => db.delete(key));

  db.cleanup();
  db.close();
}

try {
  main();
} catch (err) {
  console.error("An error occurred:", err);
}
