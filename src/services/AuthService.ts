/**
 * @fileoverview AuthService handles user authentication, including API calls
 * and secure storage of authentication tokens in localStorage.
 */

import { UserCredentials, AuthResponse } from '../types/auth'; // Assuming a types file will be created

// API endpoint constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-domain.com';
const LOGIN_ENDPOINT = '/api/login';
const AUTH_TOKEN_KEY = 'authToken';

/**
 * Attempts to log in a user by sending credentials to the backend API.
 * @param credentials User's email and password.
 * @returns A promise that resolves to an AuthResponse object indicating success or failure.
 */
export async function login(credentials: UserCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    let responseData: any = {};
    try {
      // Attempt to parse JSON response, but it might be empty or invalid for certain errors
      responseData = await response.json();
    } catch (jsonError) {
      console.warn('AuthService: Non-JSON response received from API', response.status, jsonError);
      // Fallback to empty object if JSON parsing fails
      responseData = { message: `Server responded with status ${response.status} but no valid JSON.` };
    }

    if (response.ok) { // HTTP status 200-299
      if (!responseData.token) {
        console.error('AuthService: Successful login response missing token.', responseData);
        return {
          success: false,
          token: null,
          status: response.status,
          message: 'Login successful, but no authentication token received.',
        };
      }
      return {
        success: true,
        token: responseData.token,
        status: response.status,
        message: responseData.message || 'Login successful',
      };
    } else if (response.status === 401) { // Unauthorized
      return {
        success: false,
        token: null,
        status: response.status,
        message: responseData.message || 'Invalid email or password.',
      };
    } else if (response.status >= 400 && response.status < 500) { // Client errors (e.g., 400 Bad Request)
      return {
        success: false,
        token: null,
        status: response.status,
        message: responseData.message || `Client error (${response.status}): Please check your input.`,
      };
    } else { // Server errors (5xx)
      return {
        success: false,
        token: null,
        status: response.status,
        message: responseData.message || 'An unexpected error occurred. Please try again later.',
      };
    }
  } catch (error) {
    console.error('AuthService: Network or unexpected error during login:', error);
    return {
      success: false,
      token: null,
      status: 0, // Indicate no HTTP status received (e.g., network down)
      message: 'An unexpected network error occurred. Please check your internet connection and try again.',
    };
  }
}

/**
 * Stores an item in the browser's localStorage.
 * Implements a try-catch block for robust error handling (e.g., QuotaExceededError).
 * @param key The key under which to store the item.
 * @param value The string value to store.
 */
export function setLocalStorageItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    if (error instanceof DOMException) {
      // Specific handling for localStorage related DOMExceptions
      if (error.name === 'QuotaExceededError') {
        console.error(`AuthService: localStorage QuotaExceededError for key "${key}". Storage limit reached.`, error);
      } else if (error.name === 'SecurityError') {
        console.error(`AuthService: localStorage SecurityError for key "${key}". Access denied.`, error);
      } else {
        console.error(`AuthService: Unexpected DOMException storing key "${key}" in localStorage:`, error);
      }
    } else {
      console.error(`AuthService: General error storing key "${key}" in localStorage:`, error);
    }
    // Optionally, you might want to alert the user or log to an error tracking service
  }
}

/**
 * Retrieves an item from the browser's localStorage.
 * @param key The key of the item to retrieve.
 * @returns The string value of the item, or null if not found or an error occurs.
 */
export function getLocalStorageItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`AuthService: Error retrieving key "${key}" from localStorage:`, error);
    return null;
  }
}

/**
 * Removes an item from the browser's localStorage.
 * @param key The key of the item to remove.
 */
export function removeLocalStorageItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`AuthService: Error removing key "${key}" from localStorage:`, error);
  }
}

/**
 * Checks if a user is currently authenticated by verifying the presence of an auth token.
 * @returns True if an auth token is found, false otherwise.
 */
export function isAuthenticated(): boolean {
  return getLocalStorageItem(AUTH_TOKEN_KEY) !== null;
}

/**
 * Logs out the current user by removing their authentication token from localStorage.
 */
export function logout(): void {
  removeLocalStorageItem(AUTH_TOKEN_KEY);
  // Additional cleanup like clearing user data in state/context could go here.
}
