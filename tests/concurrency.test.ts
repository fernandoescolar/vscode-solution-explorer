declare const require: (name: string) => any;

const assert = require("assert/strict");
const test = require("node:test");
import { mapWithConcurrency } from "../src/extensions/concurrency";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test("mapWithConcurrency returns results in the original order", async () => {
    const result = await mapWithConcurrency([30, 10, 20], 3, async (ms, index) => {
        await delay(ms);
        return index;
    });

    assert.deepEqual(result, [0, 1, 2]);
});

test("mapWithConcurrency never runs more than the limit at the same time", async () => {
    let running = 0;
    let maxRunning = 0;

    await mapWithConcurrency(Array.from({ length: 20 }, (_, i) => i), 4, async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await delay(5);
        running--;
    });

    assert.equal(maxRunning, 4);
});

test("mapWithConcurrency handles an empty list", async () => {
    const result = await mapWithConcurrency([], 4, async () => 1);

    assert.deepEqual(result, []);
});
