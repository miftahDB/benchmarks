import { MiftahDB } from "miftahdb";
import benchmark from "../benchmark.js";

const db = new MiftahDB("node.db");
benchmark(db, "NODE", "IN-DISK");

// const dbMemory = new MiftahDB(":memory:");
// benchmark(dbMemory, "NODE", "IN-MEMORY");
