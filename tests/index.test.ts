import { test, expect } from "vitest";
import { Decimal } from "../src/index.ts";

test("Simple test", () => {
  const dec = new Decimal();

  expect(dec.toString()).toBe("0");
});
