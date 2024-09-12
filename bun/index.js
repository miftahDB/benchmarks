import { MiftahDB } from "miftahdb/bun";
import benchmark from "../benchmark.js";

const db = new MiftahDB("bun.db");
benchmark(db, "BUN", "IN-DISK");

// const dbMemory = new MiftahDB(":memory:");
// benchmark(dbMemory, "BUN", "IN-MEMORY");
