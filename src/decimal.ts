import { between } from "./util";

export type DecimalSource = Decimal | number | string;

/**
 * Represents a number
 */
export default class Decimal {
  /** The sign of the `Decimal` value. */
  public sign: number;
  /** The "magnitude" of a `Decimal` value represents the exponent to which we raise our layers.
   *
   *	@remarks
   *	`Decimal` represents numbers with a stack of exponents. The last exponent is the magnitude, this value.
   *	The rest are 10^10^10 where layers = 3.
   * */
  public mag: number;
  /** The "layer" of a `Decimal` value represents the power of 10 we raise to the magnitude.
   *
   * */
  public layer: number;

  /**
   * Constructs a `Decimal` instance representing zero.
   *
   * @returns A `Decimal` equivalent to 0.
   * **/
  public static zero() {
    return new Decimal();
  }

  constructor(value?: DecimalSource) {
    this.sign = 0;
    this.mag = 0;
    this.layer = 0;

    if (value instanceof Decimal) {
      this.fromDecimal(value);
    }
    if (typeof value === "string") {
    }
    if (typeof value === "number") {
    }
  }

  get mantissa(): number {
    if (this.sign === 0) {
      return 0;
    } else if (this.layer === 0) {
      const exp = Math.floor(Math.log10(this.mag));

      const mantissa = this.mag === 5e-324 ? 5 : this.mag / Math.pow(10, exp);
      return this.sign * mantissa;
    } else if (this.layer === 1) {
      const residue = this.mag - Math.floor(this.mag);
      return this.sign * Math.pow(10, residue);
    } else {
      return this.sign;
    }
  }

  get exponent(): number {
    if (this.sign === 0) {
      return 0;
    }

    switch (this.layer) {
      case 0:
        return Math.floor(Math.log10(this.mag));
      case 1:
        return Math.floor(this.mag);
      case 2:
        return Math.floor(
          Math.sign(this.mag) * Math.pow(10, Math.abs(this.mag)),
        );
      default:
        return this.mag * Number.POSITIVE_INFINITY;
    }
  }

  private containsNaN() {
    return (
      Number.isNaN(this.sign) ||
      Number.isNaN(this.layer) ||
      Number.isNaN(this.mag)
    );
  }

  private isInfinite() {
    return (
      this.layer === Number.POSITIVE_INFINITY ||
      this.mag == Number.POSITIVE_INFINITY
    );
  }

  private normalize() {
    if (this.layer === 0 && this.mag < 0) {
      this.mag = -this.mag;
      this.sign = -this.sign;
    }

    // zero case, zero out
    if (this.sign === 0 || (this.layer === 0 && this.mag === 0)) {
      this.sign = 0;
      this.layer = 0;
      this.mag = 0;
    }

    // i have no clue how someone could do this
    this.sign = this.sign < 0 ? -1 : 1;

    //infinity case, propogate.
    if (
      this.mag === Number.POSITIVE_INFINITY ||
      this.layer === Number.POSITIVE_INFINITY ||
      this.mag === Number.NEGATIVE_INFINITY ||
      this.layer === Number.NEGATIVE_INFINITY
    ) {
      this.mag = Number.POSITIVE_INFINITY;
      this.layer = Number.POSITIVE_INFINITY;
      return;
    }

    if (this.layer === 0 && this.mag < 1 / Number.MAX_SAFE_INTEGER) {
      this.layer += 1;
      this.mag = Math.log10(this.mag);
      return;
    }

    let absmag = Math.abs(this.mag);
    let signmag = Math.sign(this.mag);

    if (absmag >= Number.MAX_SAFE_INTEGER) {
      this.layer += 1;
      this.mag = signmag * Math.log10(absmag);
      return;
    } else {
      while (absmag < Math.log10(Number.MAX_SAFE_INTEGER)) {
        this.layer -= 1;
        if (this.layer === 0) {
          this.mag = Math.pow(10, this.mag);
        } else {
          this.mag = signmag * Math.pow(10, absmag);
          absmag = Math.abs(this.mag);
          signmag = Math.sign(this.mag);
        }
      }
    }

    if (this.layer === 0) {
      if (this.mag < 0) {
        this.mag = -this.mag;
        this.sign = -this.sign;
      } else if (this.mag === 0) {
        this.sign = 0;
      }
    }

    // NaN case, propogate
    if (this.containsNaN()) {
      this.sign = NaN;
      this.layer = NaN;
      this.mag = NaN;
    }
  }

  public static fromComponents(sign: number, mag: number, layer: number) {
    return new Decimal().fromComponents(sign, mag, layer);
  }

  public fromComponents(sign: number, mag: number, layer: number) {
    this.sign = sign;
    this.mag = mag;
    this.layer = layer;

    this.normalize();
  }

  public static fromDecimal(value: Decimal) {
    return new Decimal().fromDecimal(value);
  }

  public fromDecimal(value: Decimal) {
    this.sign = value.sign;
    this.mag = value.mag;
    this.layer = value.layer;
  }

  public toString() {
    if (this.containsNaN()) {
      return "NaN";
    }

    if (this.isInfinite()) {
      return this.sign === 1 ? "Infinity" : "-Infinity";
    }

    if (this.layer > 1) {
      const eNotation =
        this.layer <= 5 ? "e".repeat(this.layer) : `(e^${this.layer})`;
      const sign = this.sign === -1 ? "-" : "";

      return `${sign}${eNotation}${this.mag}`;
    }

    if ((this.layer === 0 && between(this.mag, 1e-7, 1e21)) || this.mag === 0) {
      return (this.sign * this.mag).toString();
    }

    return `${this.mantissa}e${this.exponent}`;
  }
}
