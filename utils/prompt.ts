import readline from "node:readline";
import { promisify } from "util";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const prompt = promisify(rl.question).bind(rl);
