import { between } from "./util";

export type DecimalSource = Decimal | number | string;

export type CmpResult = -1 | 0 | 1;

const MAX_DIGITS = 17;

/** Condensed object of the internal representation of a {@link Decimal}.
 *
 * @remarks Mostly for testing. However, could probably be used in some cases. Usually obtained with
 * {@link Decimal.internalRepr}
 * **/
export interface LayeredRepr {
  /** The sign of the value (-1, 0, 1) **/
  sign: number;
  /** The layer of the value, representing the "height" of the {@link https://en.wikipedia.org/wiki/Tetration | tetration} of 10.**/
  layer: number;
  /** The magnitude of the value, representing the final exponent which the tetration is raised to. **/
  mag: number;
}

/**
 * Represents a number through three values, being sign, layer, and magnitude.
 *
 * @remarks This representation is fundamentally based on {@link https://en.wikipedia.org/wiki/Tetration | tetration}, repeated exponentiation.  
 * The layer represents the "height" of the tetration, height referring to the number of times we raise 10 to itself, while the magnitude is a
 * final exponent used on this value used to allow representation of more complex values.
 */
export default class Decimal {
  /** The sign of the value. */
  public sign: number;

  /** The "layer" of a `Decimal` value how many times we raise 10 to itself **/
  public layer: number;

  /** The "magnitude" of the value. **/
  public mag: number;

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

  /** Returns the internal representation of the {@link Decimal} as an object.
   *
   * @remarks
   * Primarily exists for testing purposes, as it is a lightweight object that can be easily created outside
   * of the {@link Decimal} interface while still representing the same internal representation.
   *
   * @returns A {@link LayeredRepr} for use in testing.
   * **/
  get internalRepr(): LayeredRepr {
    return {
      sign: this.sign,
      layer: this.layer,
      mag: this.mag,
    };
  }

  private get scaledLayer(): number {
    return this.layer * Math.sign(this.mag);
  }

  /** Returns whether this instance contains any NaN **/
  private containsNaN() {
    return (
      Number.isNaN(this.sign) ||
      Number.isNaN(this.layer) ||
      Number.isNaN(this.mag)
    );
  }

  /** Returns whether this instance is infinite
   * @remarks We consider any number with a infinity in its layer or magnitude to be infinite.
   * **/
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

  /** Construct a new instance to represent the passed {@link DecimalSource} (string | number | Decimal)
   * @param value - The source value
   * @returns A new instance representing the passed value
   * **/
  public static fromValue(value: DecimalSource): Decimal {
    return new Decimal().fromValue(value);
  }

  /** Set this instance to represent the passed {@link DecimalSource} (string | number | Decimal)
   * @param value - The source value  
   * @returns This instance
   * **/
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

  /** Create a new `Decimal` to represent a normal Javascript `number`
   * @param value - the number to represent
   * @param normalize - whether to normalize the resultant instance
   * @returns a new decimal representing the passed value
   * **/
  public static fromNumber(value: number, normalize: boolean = true): Decimal {
    return new Decimal().fromNumber(value, normalize);
  }

  /** Set this instance to represent a normal Javascript `number`.
   *
   * @param value - the number to represent
   * @param normalize - whether to normalize the resultant instance
   * @returns this instance **/
  public fromNumber(value: number, normalize: boolean = true): Decimal {
    this.mag = Math.abs(value);
    this.sign = Math.sign(value);
    this.layer = 0;

    if (normalize) this.normalize();

    return this;
  }

  /** Create a new decimal from the passed components. See {@link LayeredRepr}
   *
   * @param sign - The sign of the value
   * @param layer - The degree of tetration
   * @param magnitude - The magnitude applied on top of the tetration
   * @returns A new `Decimal` instance representing the passed values.
   * **/
  public static fromComponents(
    sign: number,
    layer: number,
    mag: number,
    normalize: boolean = true,
  ): Decimal {
    return new Decimal().fromComponents(sign, mag, layer, normalize);
  }

  /** Set this decimal to represent the passed components. See {@link LayeredRepr}
   *
   * @param sign - The sign of the value
   * @param layer - The degree of tetration
   * @param magnitude - The magnitude applied on top of the tetration
   * @returns This instance with new values applied.
   * **/
  public fromComponents(
    sign: number,
    layer: number,
    mag: number,
    normalize: boolean = true,
  ): Decimal {
    this.sign = sign;
    this.layer = layer;
    this.mag = mag;

    if (normalize) this.normalize();

    return this;
  }

  /** Static version of `fromDecimal`. Returns a new decimal which matches the passed instance.
   *
   * @params value - Decimal reference for new instance.
   * @returns New decimal instance.
   * **/
  public static fromDecimal(value: Decimal): Decimal {
    return new Decimal().fromDecimal(value);
  }

  /** Sets this {@link Decimal} instance to match an existing instance.
   *
   * @returns This instance.
   * **/
  public fromDecimal(value: Decimal): Decimal {
    this.sign = value.sign;
    this.mag = value.mag;
    this.layer = value.layer;
    return this;
  }

  /** Create a string representation of the {@link Decimal}.
   *
   * @remarks Many numbers representable by {@link Decimal} are far too large for any feasible exact string representation.
   * For a more exact compressed representation, you may use {@link Decimal.internalRepr} to get the sign, layer, and magnitude values
   * in a smaller object.
   *
   * @returns A representation of the value represented by this instance.
   * **/
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

  /* Operations */

  /** Static negation operation
   * Takes in a decimal and returns a negative version
   *
   * @param value - Decimal to be negated
   * @returns A decimal representation of the negation of the passed value
   * **/
  public static neg(value: DecimalSource): Decimal {
    return Decimal.fromValue(value).neg();
  }

  /** Negation operation
   * Negates the decimal it is called on and returns it.
   *
   * @returns Decimal representing negation of the instance.
   * **/
  public neg(): Decimal {
    return Decimal.fromComponents(-this.sign, this.layer, this.mag);
  }

  /* Arithmetic functions */

  /** Static addition.
   *
   * @param value - LHS of addition
   * @param other - RHS of addition
   * @returns A decimal representing LHS + RHS.
   * **/
  public static add(value: DecimalSource, other: DecimalSource): Decimal {
    return Decimal.fromValue(value).add(other);
  }

  /** Perform addition on this decimal.
   *
   * @param value - RHS of addition
   * @returns This decimal + RHS
   * **/
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
      a = new Decimal(other);
      b = new Decimal(this);
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

  /** Static subtraction.
   *
   * @remarks Equivalent to Decimal.add(x, -y).
   * @params value - LHS of subtraction
   * @params other - RHS of subtraction
   * @returns RHS-LHS in a new Decimal instance
   * **/
  public static sub(value: DecimalSource, other: DecimalSource): Decimal {
    return Decimal.fromValue(value).sub(other);
  }

  /** Subtract from this instance in-place.
   *
   * @param value - the RHS of the subtraction.
   * @returns this instance
   * **/
  public sub(value: DecimalSource): Decimal {
    return this.add(Decimal.fromValue(value).neg());
  }

  /** Calculates the absolute value of the passed parameter. 
	 * @params value - The value to make absolute 
	 * @returns A new decimal representing the absolute value.
  public static abs(value: DecimalSource): Decimal {
    return Decimal.fromValue(value).abs();
  }

  /** Calculates the absolute value of the instance.
   * @remarks Due to the representation used, this function essentially just replaces decimals with a -1 sign.
   * @returns A new instance containing the absolute value.
   * **/
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
