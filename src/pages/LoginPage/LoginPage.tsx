/**
 * @fileoverview LoginPage component provides the user interface for logging into the application.
 * It handles input fields, client-side validation, interaction with the authentication service,
 * and displaying feedback to the user.
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../../services/AuthService';
import * as ValidationService from '../../services/ValidationService';
import { UserCredentials } from '../../types/auth';
import styles from './LoginPage.module.css'; // Import module CSS for scoped styles
import EyeIcon from './EyeIcon';

// Max lengths from FR-002 and FR-003
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Redirect if already authenticated on component mount
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  /**
   * Validates the email input field based on its value.
   * @param emailValue The current value of the email input.
   * @returns An error message string if invalid, otherwise an empty string.
   */
  const validateEmailField = (emailValue: string): string => {
    if (emailValue.length > EMAIL_MAX_LENGTH) {
      return `Email address is too long (max ${EMAIL_MAX_LENGTH} characters).`;
    }
    if (emailValue && !ValidationService.isValidEmailFormat(emailValue)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  /**
   * Validates the password input field based on its value.
   * @param passwordValue The current value of the password input.
   * @returns An error message string if invalid, otherwise an empty string.
   */
  const validatePasswordField = (passwordValue: string): string => {
    if (passwordValue.length > PASSWORD_MAX_LENGTH) {
      return `Password is too long (max ${PASSWORD_MAX_LENGTH} characters).`;
    }
    if (passwordValue && !ValidationService.hasMinLength(passwordValue, PASSWORD_MIN_LENGTH)) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
    }
    return '';
  };

  /**
   * Handles changes in input fields (email or password).
   * Updates state and re-validates if an error was previously shown for that field.
   * Clears any global login error message.
   * @param e The change event from the input field.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setLoginError(''); // Clear any API-level errors on new input

    if (name === 'email') {
      setEmail(value);
      if (emailError) { // Re-validate if an error was previously displayed
        setEmailError(validateEmailField(value));
      }
    } else if (name === 'password') {
      setPassword(value);
      if (passwordError) { // Re-validate if an error was previously displayed
        setPasswordError(validatePasswordField(value));
      }
    }
  };

  /**
   * Handles blur events for input fields, triggering client-side validation.
   * @param e The blur event from the input field.
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmailError(validateEmailField(value));
    } else if (name === 'password') {
      setPasswordError(validatePasswordField(value));
    }
  };

  /**
   * Checks if the entire form is valid for submission.
   * Both fields must be non-empty and pass client-side validation.
   * @returns True if the form is valid, false otherwise.
   */
  const isFormValid = (): boolean => {
    return (
      email.trim() !== '' &&
      password.trim() !== '' &&
      !validateEmailField(email) &&
      !validatePasswordField(password)
    );
  };

  /**
   * Handles the submission of the login form.
   * Performs client-side validation, calls the authentication service,
   * stores the token on success, and redirects the user.
   * @param e The form submission event.
   */
  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Re-validate all fields on submit to ensure latest state
    const currentEmailError = validateEmailField(email);
    const currentPasswordError = validatePasswordField(password);

    setEmailError(currentEmailError);
    setPasswordError(currentPasswordError);
    setLoginError(''); // Clear any previous API error

    if (currentEmailError || currentPasswordError || !isFormValid()) {
      return; // Do not proceed if client-side validation fails
    }

    setIsSubmitting(true);

    try {
      const credentials: UserCredentials = { email, password };
      const authResponse = await AuthService.login(credentials);

      if (authResponse.success && authResponse.token) {
        AuthService.setLocalStorageItem('authToken', authResponse.token);
        navigate('/dashboard', { replace: true });
      } else {
        // Display specific error message from AuthResponse
        setLoginError(authResponse.message || 'An unknown error occurred during login.');
      }
    } catch (error) {
      console.error('LoginPage: Error during login submission:', error);
      setLoginError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['login-page-container']}>
      <form onSubmit={handleLoginSubmit} noValidate>
        <h2>Log In</h2>

        {/* Email Input Field */}
        <div className="form-group">
          <label htmlFor="email-input" id="email-label">
            Email Address
          </label>
          <input
            type="email"
            id="email-input"
            name="email"
            className="form-input"
            value={email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            maxLength={EMAIL_MAX_LENGTH}
            aria-required="true"
            aria-invalid={emailError ? 'true' : 'false'}
            aria-describedby={emailError ? 'email-error-message' : undefined}
            tabIndex={1}
            autoComplete="email"
          />
          {emailError && (
            <p id="email-error-message" className="error-message" role="alert" aria-live="assertive">
              {emailError}
            </p>
          )}
        </div>

        {/* Password Input Field */}
        <div className="form-group">
          <label htmlFor="password-input" id="password-label">
            Password
          </label>
          <div className={styles['password-input-wrapper']}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password-input"
              name="password"
              className="form-input"
              value={password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              aria-required="true"
              aria-invalid={passwordError ? 'true' : 'false'}
              aria-describedby={passwordError ? 'password-error-message' : undefined}
              tabIndex={2}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles['toggle-password-visibility']}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1} // Prevents button from being tabbed to, focus remains on input
            >
              <EyeIcon isVisible={showPassword} />
            </button>
          </div>
          {passwordError && (
            <p id="password-error-message" className="error-message" role="alert" aria-live="assertive">
              {passwordError}
            </p>
          )}
        </div>

        {/* API-level Error Display */}
        {loginError && (
          <p className={styles['api-error-message']} role="alert" aria-live="assertive">
            {loginError}
          </p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          className="login-button"
          disabled={!isFormValid() || isSubmitting}
          aria-busy={isSubmitting ? 'true' : 'false'}
          aria-live="polite"
          tabIndex={3}
        >
          {isSubmitting ? 'Logging In...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
