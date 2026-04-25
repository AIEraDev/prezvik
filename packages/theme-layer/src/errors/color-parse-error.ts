/**
 * Error thrown when a color string cannot be parsed
 */
export class ColorParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ColorParseError";
  }
}
