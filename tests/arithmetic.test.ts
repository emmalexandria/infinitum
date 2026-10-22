import { test, expect, describe } from "bun:test";

import { Decimal } from "../src";
import BEDecimal from "break_eternity.js";

describe("Addition", () => {
  const commTests = [
    [45, 13],
    [1e23, 1e76],
    [1e-10, 1e32],
    [-1e30, 1e64],
  ];

  describe("Commutation", () => {
    test.each(commTests)("Commute %p + %p", (a, b) => {
      expect(new Decimal(a).add(new Decimal(b)).internalRepr).toEqual(
        new Decimal(b).add(new Decimal(a)).internalRepr,
      );
    });
  });

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
      ...commTests,
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
    test("Layer 1", () => {});
  });
});
