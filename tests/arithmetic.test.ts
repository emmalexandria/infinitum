import { test, expect } from "bun:test";

import { Decimal } from "../src";
import BEDecimal from "break_eternity.js";

test("Test layer 0 addition", () => {
  const a = Decimal.fromNumber(45);
  const b = Decimal.fromNumber(32);

  const sum = a.add(b);

  expect(sum.toString()).toBe("77");
});

test("Test layer 0 addition (negative b)", () => {
  const a = Decimal.fromNumber(45);
  const b = Decimal.fromNumber(-32);

  console.log(a.toString(), b.toString());

  const sum = a.add(b);

  expect(sum.toString()).toBe("13");
});
