import { test, expect } from "bun:test";
import { Decimal } from "../src/index.ts";

test("Simple test", () => {
  const dec = new Decimal();

  expect(dec.toString()).toBe("0");
});
