import MiftahDB from "https://deno.land/x/miftahdb/mod.ts";

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

  benchmark(db, "set", keyPairs, (db, [key, value]) => db.set(key, value));
  benchmark(db, "get", keys, (db, key) => db.get(key));
  benchmark(db, "exists", keys, (db, key) => db.exists(key));
  benchmark(db, "delete", keys, (db, key) => db.delete(key));

  const renamePairs = keys.map((key) => [key, randomString(10)]);
  benchmark(db, "rename", renamePairs, (db, [oldKey, newKey]) =>
    db.rename(oldKey, newKey)
  );
}

try {
  main();
} catch (err) {
  console.error("An error occurred:", err);
  Deno.exit(1);
}
