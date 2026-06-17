/**
 * @fileoverview ValidationService provides utility functions for client-side input validation.
 * This module centralizes common validation rules, ensuring consistency across the application.
 */

/**
 * Regular expression for standard email format validation.
 * It checks for characters before '@', characters between '@' and '.', and characters after '.'.
 * It does not cover all edge cases of RFC 5322 but is sufficient for common use cases.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks if the given string is a valid email format.
 * @param email The email string to validate.
 * @returns True if the email matches the standard format, false otherwise.
 */
export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Checks if the given string has a minimum required length.
 * @param value The string to check.
 * @param minLength The minimum allowed length.
 * @returns True if the string meets or exceeds the minimum length, false otherwise.
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Checks if the given string has a maximum required length.
 * @param value The string to check.
 * @param maxLength The maximum allowed length.
 * @returns True if the string is within or at the maximum length, false otherwise.
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}
