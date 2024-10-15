interface Serializable {
  toJSON(): string;
}

// Safely extend BigInt.prototype with a toJSON method, converting to 'unknown' first
(BigInt.prototype as unknown as Serializable).toJSON = function (): string {
  return this.toString();
};
