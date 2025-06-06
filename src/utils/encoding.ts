import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

/**
 * Compresses a string and encodes it into a URL-safe format.
 * This is ideal for passing long strings in URL parameters.
 * @param input The raw string to compress and encode.
 * @returns A URL-safe, compressed string.
 */
export function compressAndEncode(input: string): string {
  if (!input) {
    return '';
  }
  return compressToEncodedURIComponent(input);
}

/**
 * Decompresses a string from a URL-safe, compressed format.
 * @param input The compressed string from a URL.
 * @returns The original, decompressed string, or null if input is invalid.
 */
export function decompressAndDecode(input: string): string | null {
  if (!input) {
    return null;
  }
  // The library handles invalid input gracefully by returning null.
  return decompressFromEncodedURIComponent(input);
} 