import { test, expect, describe } from "bun:test";

import { Decimal } from "../src";
import BEDecimal from "break_eternity.js";

describe("Addition", () => {
  describe("Layer zero", () => {
    test("Positive", () => {
      const a = Decimal.fromNumber(45);
      const b = Decimal.fromNumber(32);

      const sum = a.add(b);
      expect(sum.toString()).toBe("77");
    });

    test("Positive + negative", () => {
      const a = Decimal.fromNumber(45);
      const b = Decimal.fromNumber(-32);

      const sum = a.add(b);
      expect(sum.toString()).toBe("13");
    });

    test("Negative + negative", () => {
      const a = Decimal.fromNumber(-45);
      const b = Decimal.fromNumber(-32);

      const sum = a.add(b);
      expect(sum.toString()).toBe("-77");
    });

    const parityTests = [
      [12, 34],
      [-734, 54],
      [523523432, -43243242],
      [-9154321432, -912341432],
    ];

    describe("BE parity", () => {
      test.each(parityTests)("%p + %p", (a, b) => {
        expect(Decimal.add(a, b).toString()).toBe(
          BEDecimal.add(a, b).toString(),
        );
      });
    });
  });

  describe("Higher layers", () => {
    test("Layer 1", () => {
      const orig = BEDecimal.fromComponents(1, 1, 1).add(
        BEDecimal.fromComponents(1, 1, 1),
      );
      const t = Decimal.fromComponents(1, 1, 1).add(
        Decimal.fromComponents(1, 1, 1),
      );

      expect(t.toString()).toBe(orig.toString());
    });
  });
});
