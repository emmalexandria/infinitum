import { between } from "./util";

export type DecimalSource = Decimal | number | string;

export type CmpResult = -1 | 0 | 1;

const MAX_DIGITS = 17;

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

  private get scaledLayer(): number {
    return this.layer * Math.sign(this.mag);
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
      while (this.layer > 0 && absmag < Math.log10(Number.MAX_SAFE_INTEGER)) {
        this.layer -= 1;
        this.mag = signmag * Math.pow(10, absmag);
        absmag = Math.abs(this.mag);
        signmag = Math.sign(this.mag);
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

  public static fromValue(value: DecimalSource): Decimal {
    return new Decimal().fromValue(value);
  }

  public fromValue(value: DecimalSource): Decimal {
    if (value instanceof Decimal) {
      return this.fromDecimal(value);
    }

    if (typeof value === "number") {
      return this.fromNumber(value);
    }

    if (typeof value === "string") {
      throw Error("Conversion from string currently unsupported");
    }

    this.sign = 0;
    this.layer = 0;
    this.mag = 0;
    return this;
  }

  public static fromNumber(value: number, normalize: boolean = true): Decimal {
    return new Decimal().fromNumber(value, normalize);
  }

  public fromNumber(value: number, normalize: boolean = true): Decimal {
    this.mag = Math.abs(value);
    this.sign = Math.sign(value);
    this.layer = 0;

    if (normalize) this.normalize();

    return this;
  }

  public static fromComponents(
    sign: number,
    mag: number,
    layer: number,
  ): Decimal {
    return new Decimal().fromComponents(sign, mag, layer);
  }

  public fromComponents(
    sign: number,
    mag: number,
    layer: number,
    normalize: boolean = true,
  ): Decimal {
    this.sign = sign;
    this.mag = mag;
    this.layer = layer;

    if (normalize) this.normalize();

    return this;
  }

  public static fromDecimal(value: Decimal): Decimal {
    return new Decimal().fromDecimal(value);
  }

  public fromDecimal(value: Decimal): Decimal {
    this.sign = value.sign;
    this.mag = value.mag;
    this.layer = value.layer;
    return this;
  }

  public toString(): string {
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

  /* Arithmetic functions */

  public add(value: DecimalSource): Decimal {
    const other = Decimal.fromValue(value);

    // NOTE: break_eternity does a check for -inf + inf = NaN here:
    // but i'm not sure that actually makes sense given that
    // our decimal representation normalizes -inf to inf, so
    // i left it out for now

    // if (
    //   (this.eq(Decimal.dInf) && decimal.eq(Decimal.dNegInf)) ||
    //   (this.eq(Decimal.dNegInf) && decimal.eq(Decimal.dInf))
    // ) {
    //   return new Decimal(Decimal.dNaN);
    // }

    // NOTE: here, break_eternity checks for infinity in a non-internally consistent way (as far as i can tell)
    // elsewhere in the library, we consider an infinity in either sign or layer as
    // being an infinite number (which seems correct), the original library only
    // considered infinities in layer when checking here
    if (this.isInfinite()) {
      return new Decimal(this);
    }
    if (other.isInfinite()) {
      return new Decimal(other);
    }

    if (this.sign === 0) {
      return new Decimal(other);
    }
    if (other.sign === 0) {
      return new Decimal(this);
    }

    if (
      this.sign === -other.sign &&
      this.layer === other.layer &&
      this.mag === other.mag
    ) {
      return Decimal.fromNumber(0);
    }

    // TODO: copied from break_eternity, the intuition here is that addition becomes insignificant layer 2 and above.
    // i want to verify that.
    if (this.layer >= 2 || other.layer >= 2) {
      return this.maxabs(other);
    }

    if (this.layer === 0 && other.layer === 0) {
      return Decimal.fromNumber(this.sign * this.mag + other.sign * other.mag);
    }

    let a;
    let b;

    if (Decimal.cmpabs(this, other) > 0) {
      a = new Decimal(this);
      b = new Decimal(other);
    } else {
      a = new Decimal(this);
      b = new Decimal(other);
    }

    if (a.scaledLayer - b.scaledLayer >= 2) {
      return a;
    }

    let magdiff;

    if (a.scaledLayer === 0 && b.scaledLayer === -1) {
      if (Math.abs(b.mag - Math.log10(a.mag)) > MAX_DIGITS) return a;
      else magdiff = Math.pow(10, Math.log10(a.mag - b.mag));
    }

    if (a.scaledLayer === 1 && b.scaledLayer === 0) {
      if (Math.abs(a.mag - Math.log10(b.mag)) > MAX_DIGITS) return a;
      else magdiff = Math.pow(10, a.mag - Math.log10(b.mag));
    }

    if (Math.abs(a.mag - b.mag) > MAX_DIGITS) return a;
    else magdiff = Math.pow(10, a.mag - b.mag);

    const magBase = a.layer === 1 && b.layer === 0 ? Math.log10(b.mag) : b.mag;
    const mantissa = b.sign + a.sign * magdiff;

    return Decimal.fromComponents(
      Math.sign(mantissa),
      1,
      magBase + Math.log10(Math.abs(mantissa)),
    );
  }

  public abs(): Decimal {
    return Decimal.fromComponents(
      this.sign === 0 ? 0 : 1,
      this.layer,
      this.mag,
    );
  }

  /* Comparison functions */

  /** Static version of `maxabs`. Takes two decimals and calculates which has a greater absolute value.
   * @returns The maximum absolute decimal.
   * **/
  public static maxabs(value: DecimalSource, other: DecimalSource): Decimal {
    return Decimal.fromValue(value).maxabs(other);
  }

  /** Calculates the maximum absolute decimal between the instance and passed value
   *	@returns The maximum absolute decimal.
   * **/
  public maxabs(value: DecimalSource): Decimal {
    const other = Decimal.fromValue(value);
    return this.cmpabs(other) < 0 ? new Decimal(other) : new Decimal(this);
  }

  /** Static version of `cmpabs`. Takes two decimals and compares them.
   * @returns 1 if `other` is smaller, -1 if bigger, 0 if equivalent
   * **/
  public static cmpabs(value: DecimalSource, other: DecimalSource): CmpResult {
    return Decimal.fromValue(value).cmpabs(other);
  }

  /** Comparison function for the absolute value of two decimals.
   *
   * @returns 1 if passed decimal is smaller, -1 if bigger, 0 if equivalent.
   * **/
  public cmpabs(value: DecimalSource): CmpResult {
    const other = Decimal.fromValue(value);

    if (this.scaledLayer > other.scaledLayer) return 1;
    if (other.scaledLayer > this.scaledLayer) return -1;

    // numbers are on the same layer, turn to mag
    if (this.mag > other.mag) return 1;
    if (other.mag > this.mag) return -1;

    return 0;
  }
}
