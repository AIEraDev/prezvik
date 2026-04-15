import { DeckSchema, type DeckSchemaType as Deck } from "./deck";
import { SlideSchema, type Slide } from "./slide";
import { SlideTypeValidators } from "./types";

/**
 * Parse and validate a complete deck
 *
 * Validation pipeline:
 * 1. Base schema validation (structure)
 * 2. Type-specific content validation (semantics)
 * 3. Normalization
 *
 * @throws {ZodError} if validation fails
 */
export function parseDeck(input: unknown): Deck {
  // Step 1: Base validation
  const deck = DeckSchema.parse(input);

  // Step 2: Type-specific validation for each slide
  const validatedSlides = deck.slides.map((slide: Slide) => {
    const validator = SlideTypeValidators[slide.type as keyof typeof SlideTypeValidators];

    // Allow unknown types (extensibility for plugins/experiments)
    if (!validator) return slide;

    // Validate content against type-specific schema
    const validatedContent = validator.parse(slide.content);

    return {
      ...slide,
      content: validatedContent,
    };
  });

  // Step 3: Return normalized deck
  return {
    ...deck,
    slides: validatedSlides,
  };
}

/**
 * Safely parse a deck without throwing
 * Returns result object with either data or error
 */
export function safeParseDeck(input: unknown) {
  try {
    const deck = parseDeck(input);
    return { success: true as const, data: deck };
  } catch (error) {
    return { success: false as const, error };
  }
}

/**
 * Validate a single slide
 * @throws {ZodError} if validation fails
 */
export function validateSlide(data: unknown): Slide {
  return SlideSchema.parse(data);
}

/**
 * Safely validate a slide object
 * Returns a result object with either data or error
 */
export function safeParseSlide(data: unknown) {
  return SlideSchema.safeParse(data);
}

/**
 * Validate slide content against its type-specific schema
 * @throws {ZodError} if validation fails
 */
export function validateSlideContent(type: string, content: unknown) {
  const validator = SlideTypeValidators[type as keyof typeof SlideTypeValidators];

  if (!validator) {
    throw new Error(`Unknown slide type: ${type}`);
  }

  return validator.parse(content);
}

/**
 * Check if a slide type is supported
 */
export function isSupportedSlideType(type: string): boolean {
  return type in SlideTypeValidators;
}

/**
 * Get all supported slide types
 */
export function getSupportedSlideTypes(): string[] {
  return Object.keys(SlideTypeValidators);
}

/**
 * Check if data is a valid deck without throwing
 */
export function isDeck(data: unknown): data is Deck {
  return safeParseDeck(data).success;
}

/**
 * Check if data is a valid slide without throwing
 */
export function isSlide(data: unknown): data is Slide {
  return SlideSchema.safeParse(data).success;
}
