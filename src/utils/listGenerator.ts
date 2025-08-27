import verbalId from 'verbal-id';

/**
 * Configuration options for list ID generation
 */
export interface ListIdOptions {
  /** Character to use as separator between words (default: '-') */
  separator?: string;
}

/**
 * Error thrown when list ID generation fails
 */
export class ListIdGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ListIdGenerationError';
  }
}

/**
 * Generates a unique, human-readable identifier for lists using verbal-id.
 * The generated ID consists of 4 words that are:
 * - Easy to pronounce and understand
 * - Typo-tolerant (using phonetic matching)
 * - Free from inappropriate combinations
 * - Unique (represents a 36-bit number + 4-bit checksum)
 * 
 * @param {ListIdOptions} options - Configuration options
 * @returns {string} A unique 4-word identifier with words separated by hyphens
 * @throws {ListIdGenerationError} If ID generation fails
 * 
 * @example
 * ```ts
 * // Generate a list ID with default options (hyphen separator)
 * const id = generateListId(); // e.g., "vacant-brand-orchestra-kiwi"
 * 
 * // Generate a list ID with custom separator
 * const id = generateListId({ separator: '_' }); // e.g., "vacant_brand_orchestra_kiwi"
 * ```
 */
export function generateListId(options: ListIdOptions = {}): string {
  try {
    const { separator = '-' } = options;
    const id = verbalId.create();
    
    // Replace spaces with the specified separator
    return id.replace(/ /g, separator);
  } catch (error) {
    throw new ListIdGenerationError(
      `Failed to generate list ID: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}