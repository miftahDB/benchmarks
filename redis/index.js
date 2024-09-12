import { performance } from "node:perf_hooks";
import { createClient } from "redis";

const QUERY_COUNT = 100000; // Number of queries to benchmark
const KEY_LENGTH = 10; // Length of the key
const VALUE_LENGTH = 50; // Length of the value

function randomString(length) {
  return Array.from({ length }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");
}

function formatTime(ms) {
  return (ms / 1000).toFixed(2);
}

async function runBenchmark(db, operation, action, data) {
  console.log(`\n* Running Benchmark: ${operation}`);

  const start = performance.now();
  await action(db, data);
  const duration = performance.now() - start;

  const averageLatency = duration / QUERY_COUNT;
  const operationsPerSecond = Math.floor(QUERY_COUNT / (duration / 1000));

  console.log(`* Benchmark Complete: ${operation}`);
  return {
    Operation: operation,
    "Total Time (s)": formatTime(duration),
    "Avg Latency (ms)": averageLatency.toFixed(4),
    "Ops/Second": operationsPerSecond.toLocaleString(),
  };
}

export default async function benchmark(db, runtime, type) {
  console.log(`Starting benchmark with ${QUERY_COUNT} queries...`);
  console.log("Wait for all benchmarks to complete to print the table.");

  const keys = Array.from({ length: QUERY_COUNT }, () =>
    randomString(KEY_LENGTH),
  );
  const values = Array.from({ length: QUERY_COUNT }, () =>
    randomString(VALUE_LENGTH),
  );
  const keyValuePairs = keys.map((key, index) => ({
    key,
    value: values[index],
  }));

  const benchmarks = [
    {
      name: "Set",
      action: async (db, data) => {
        for (const { key, value } of data) {
          await db.set(key, value);
        }
      },
      data: keyValuePairs,
    },
    {
      name: "Get",
      action: async (db, data) => {
        for (const key of data) {
          await db.get(key);
        }
      },
      data: keys,
    },
  ];

  const results = [];
  for (const benchmark of benchmarks) {
    const result = await runBenchmark(
      db,
      benchmark.name,
      benchmark.action,
      benchmark.data,
    );
    results.push(result);
  }

  console.log(
    `\n${QUERY_COUNT} Queries Benchmark Summary ( ${runtime} ), ( ${type} ):`,
  );
  console.table(results);

  console.log("\nBenchmark completed.");
}


function run() {
  const db = createClient();
  db.connect();
  benchmark(db, "Node.js", "redis");
  db.disconnect();
}

run()
