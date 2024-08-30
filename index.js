const MiftahDB = require("miftahdb");
const { performance } = require("perf_hooks");
const process = require("process");

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

async function benchmark(db, operation, keys, action) {
  console.log(`\n* Benchmark ${operation}`);

  let totalLatency = 0;
  const start = performance.now();

  for (const key of keys) {
    const latencyStart = performance.now();
    await action(db, key);
    totalLatency += performance.now() - latencyStart;
  }

  const duration = performance.now() - start;
  console.log(`${queryCount} queries took: ${formatTime(duration)} seconds`);
  console.log(`QPS: ${Math.floor(queryCount / (duration / 1000))}`);
  console.log(
    `Average latency: ${(totalLatency / queryCount).toFixed(4)} milliseconds`
  );
}

async function main() {
  console.log(`Starting benchmark with ${queryCount} queries...`);
  const db = new MiftahDB("benchmark.db");

  const keys = Array.from({ length: queryCount }, () => randomString(10));
  const keyPairs = keys.map((key) => [key, randomString(50)]);

  await benchmark(db, "set", keyPairs, (db, [key, value]) =>
    db.set(key, value)
  );
  await benchmark(db, "get", keys, (db, key) => db.get(key));
  await benchmark(db, "exists", keys, (db, key) => db.exists(key));
  await benchmark(db, "delete", keys, (db, key) => db.delete(key));
  await benchmark(db, "rename", keyPairs, (db, [oldKey, newKey]) =>
    db.rename(oldKey, newKey)
  );
  await benchmark(db, "expireAt", keys, (db, key) => db.expireAt(key));
}

main().catch((err) => {
  console.error("An error occurred:", err);
  process.exit(1);
});
