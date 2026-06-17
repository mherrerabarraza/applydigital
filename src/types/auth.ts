/**
 * @fileoverview Defines TypeScript interfaces for authentication-related data models.
 */

/**
 * Represents the user credentials collected from the login form inputs.
 */
export interface UserCredentials {
  email: string;
  password: string;
}

/**
 * Represents the structured response expected from the authentication API.
 */
export interface AuthResponse {
  success: boolean;       // Indicates if the authentication was successful
  token: string | null;   // The authentication token (e.g., JWT) if successful
  status: number;         // The HTTP status code of the response
  message: string | null; // A message related to the authentication attempt (e.g., error message)
}
