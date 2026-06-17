This Refinement Document critically reviews the prior outputs (Specification, Pseudocode, and Architecture) for consistency and completeness. It then outlines a robust testing strategy, identifies key optimization opportunities, conducts a security review, and provides an implementation-ready checklist to guide development.

---

# Refinement Document: Login Page Implementation

## 1. Review of Prior Outputs

### 1.1. Consistency & Gap Analysis

**Overall Assessment:** The Specification, Pseudocode, and Architecture documents are generally consistent and well-aligned, providing a solid foundation for implementation. Minor discrepancies and potential areas for enhancement have been identified below.

**Key Findings:**

1.  **Pseudocode Clarity on `localStorage` vs. `AUTH_SERVICE.IS_AUTHENTICATED()`:**
    *   **Finding:** The `LOGIN_PAGE_COMPONENT` pseudocode's `EFFECT ON_MOUNT` directly calls `AUTH_SERVICE.GET_LOCAL_STORAGE_ITEM("authToken")` to check for an existing token. The `AUTH_SERVICE` module *also* defines `IS_AUTHENTICATED()`.
    *   **Recommendation:** For better abstraction and adherence to the service layer pattern, the `LOGIN_PAGE_COMPONENT` should use `AUTH_SERVICE.IS_AUTHENTICATED()` for checking authentication status.
    *   **Action:** Update `LOGIN_PAGE_COMPONENT` pseudocode to use `AUTH_SERVICE.IS_AUTHENTICATED()`.

2.  **Password Visibility Toggle (UX Enhancement):**
    *   **Finding:** The `LOGIN_PAGE_COMPONENT` pseudocode includes `showPassword` state and a toggle button with an `<SVG_EYE_ICON />`. This is a valuable UX feature but was not explicitly called out in the Functional Requirements (FRs) or Acceptance Criteria (ACs).
    *   **Recommendation:** This is a good enhancement. It should be explicitly noted in the implementation checklist.
    *   **Action:** Add to Implementation Checklist.

3.  **Specific Network Error Message:**
    *   **Finding:** FR-008 specifies a generic error message: "An unexpected error occurred. Please try again later." The `AUTH_SERVICE.LOGIN` pseudocode's network error catch block, however, provides a more specific message: "An unexpected network error occurred. Please check your internet connection and try again."
    *   **Recommendation:** The more specific message is better for user guidance. Either update FR-008 to reflect this specificity or clarify that the pseudocode message is an acceptable refinement of FR-008. Given the goal of helpful error messages, the pseudocode version is preferred.
    *   **Action:** Clarify in the implementation that the `AuthService`'s more specific network error message is acceptable, aligning with the spirit of helpful error handling.

4.  **`react-router-dom` Versioning:**
    *   **Finding:** Constraint C-005 states that `react-router-dom` must be integrated, but no specific version is given, unlike other dependencies (C-001). The Architecture mentions "latest compatible version".
    *   **Recommendation:** Pin `react-router-dom` to a stable version compatible with React 19 (e.g., `^6.x.x` if compatible, or the latest stable compatible for React 19). This prevents unexpected breaking changes from newer versions during installation.
    *   **Action:** Add specific `react-router-dom` version to the `package.json` entry in the implementation checklist.

5.  **`localStorage` Error Handling in `AuthService`:**
    *   **Finding:** The "Design for Failure" section in the Architecture document correctly identifies `localStorage` failure (e.g., `QuotaExceededError`, `SecurityError`) as a risk. However, the `AUTH_SERVICE` pseudocode for `SET_LOCAL_STORAGE_ITEM` does not include a `try...catch` block to handle these potential runtime exceptions.
    *   **Recommendation:** Implement robust `try...catch` blocks around `localStorage` operations within `AuthService` to prevent application crashes and provide graceful error handling if storage fails.
    *   **Action:** Add to Implementation Checklist and include in `AuthService` unit tests.

6.  **Tab Index Usage:**
    *   **Finding:** The `LOGIN_PAGE_COMPONENT` pseudocode explicitly uses `TAB_INDEX` attributes (e.g., `TAB_INDEX="1"`). While NFR-004 requires logical keyboard navigation, explicit `tabIndex` values can be brittle. Natural DOM order often suffices, with `tabIndex="-1"` used for elements that should be focusable programmatically but not via tab key.
    *   **Recommendation:** Prioritize ensuring elements are rendered in a logical DOM order. Only use `tabIndex` for explicit overrides when natural order cannot be achieved or for non-standard focusable elements. For the password toggle button, `tabIndex="-1"` is appropriate as the input field already handles focus.
    *   **Action:** Update implementation checklist to prioritize natural DOM order for keyboard navigation.

### 1.2. Error Handling Strengthening

Beyond the identified `localStorage` error handling gap, the existing error handling is largely solid:

*   **Specific Client-Side Validation Errors:** FR-009, FR-010 are well-defined.
*   **Specific Backend 401 Error:** FR-007 is clear.
*   **Generic Backend/Network Errors:** FR-008 and the more detailed pseudocode message provide graceful fallback.
*   **Loading State:** `isSubmitting` provides UX feedback during API calls.
*   **Retry:** The UI re-enables the login button for manual retries, which is appropriate for a user-facing form.
*   **Circuit Breakers/Exponential Backoff:** Not applicable for this single, direct user interaction.

**Strengthening Action:** Implement `try...catch` blocks for `localStorage` operations as identified above. This covers a critical client-side failure mode.

### 1.3. Cyclomatic Complexity Reduction

The current pseudocode indicates a well-structured approach:

*   **Modular Services:** `AUTH_SERVICE` and `VALIDATION_SERVICE` encapsulate specific concerns, keeping the `LOGIN_PAGE_COMPONENT` leaner.
*   **Extracted Validation Logic:** `VALIDATE_EMAIL_FIELD`, `VALIDATE_PASSWORD_FIELD`, and `IS_FORM_VALID` are separate functions, improving readability and testability.
*   **Asynchronous Flow:** The `HANDLE_LOGIN_SUBMIT` function manages the async flow with a `try...catch...finally` block, which is standard and clear.

No immediate concerns regarding high cyclomatic complexity have been identified, given the scope of a single login form. The structure is clean and adheres to good React/TypeScript practices.

## 2. Test Cases

### 2.1. Unit Test Cases

Unit tests will focus on individual functions and components in isolation.

#### `VALIDATION_SERVICE` Module Tests

*   **`IS_VALID_EMAIL_FORMAT` Function:**
    *   `should return true for a valid email format` (e.g., "test@example.com", "first.last@domain.co.uk")
    *   `should return false for an email without @` (e.g., "testexample.com")
    *   `should return false for an email without domain` (e.g., "test@.com")
    *   `should return false for an email with invalid characters` (e.g., "test@example..com", "test@example_com")
    *   `should return false for an empty string`
    *   `should return false for a string with only whitespace`

#### `AUTH_SERVICE` Module Tests

*   **`LOGIN` Function:**
    *   `should return success: true and a token on successful API response (200 OK)`
    *   `should return success: false and specific message on 401 Unauthorized`
    *   `should return success: false and generic message on 500 Internal Server Error`
    *   `should return success: false and generic message on network error`
    *   `should return success: false and generic message when API response is not valid JSON but status is not OK`
    *   `should include status code in AuthResponse for different API responses`
*   **`SET_LOCAL_STORAGE_ITEM` Function:**
    *   `should store item in localStorage correctly`
    *   `should handle localStorage QuotaExceededError gracefully` (mocking `localStorage.setItem` to throw)
    *   `should handle localStorage SecurityError gracefully` (mocking `localStorage.setItem` to throw)
*   **`GET_LOCAL_STORAGE_ITEM` Function:**
    *   `should retrieve item from localStorage correctly`
    *   `should return null if item does not exist`
*   **`REMOVE_LOCAL_STORAGE_ITEM` Function:**
    *   `should remove item from localStorage correctly`
*   **`IS_AUTHENTICATED` Function:**
    *   `should return true if authToken exists in localStorage`
    *   `should return false if authToken does not exist in localStorage`

#### `LOGIN_PAGE_COMPONENT` Unit Tests (using Testing Library & Jest/Vitest)

*   **Initial Rendering & State:**
    *   `should render email and password input fields and a disabled login button`
    *   `should not display any error messages initially`
    *   `should redirect to /dashboard if authToken exists in localStorage on mount`
*   **Input Handling:**
    *   `should update email state when email input changes`
    *   `should update password state when password input changes`
    *   `should clear API-level login error when any input changes`
*   **Client-Side Validation (on blur):**
    *   `should display email format error on blur if email is invalid`
    *   `should display password length error on blur if password is too short`
    *   `should clear email error when valid email is entered after invalid input`
    *   `should clear password error when valid password is entered after invalid input`
    *   `should not display email error if field is empty on blur`
    *   `should not display password error if field is empty on blur`
    *   `should display max length error for email if exceeded`
    *   `should display max length error for password if exceeded`
*   **Login Button Enablement (FR-004):**
    *   `should keep login button disabled if email is valid but password is empty`
    *   `should keep login button disabled if password is valid but email is empty`
    *   `should keep login button disabled if email is invalid (format)`
    *   `should keep login button disabled if password is invalid (too short)`
    *   `should enable login button when both email and password are valid and non-empty`
    *   `should disable login button while authentication request is in progress (isSubmitting)`
*   **Password Visibility Toggle:**
    *   `should toggle password input type between 'password' and 'text'`
    *   `should update ARIA label on password toggle button`
*   **Form Submission & API Interaction:**
    *   `should prevent default form submission`
    *   `should display email validation error on submit if email is invalid`
    *   `should display password validation error on submit if password is too short`
    *   `should call AuthService.LOGIN with correct credentials on valid form submission`
    *   `should display "Logging In..." text on button and disable it during submission`
    *   `should display "Invalid email or password." for a 401 API response (FR-007)`
    *   `should display "An unexpected error occurred..." for a 5xx API response (FR-008)`
    *   `should display "An unexpected network error occurred..." for a network error`
    *   `should store authToken in localStorage and redirect to /dashboard on successful login`
    *   `should not store authToken or redirect on failed login`
*   **Accessibility (NFR-004, NFR-005):**
    *   `should have correct ARIA attributes for email input and its error message`
    *   `should have correct ARIA attributes for password input and its error message`
    *   `should have correct ARIA attributes for general login error message`
    *   `should have correct ARIA attributes for the login button during submission`
    *   `should ensure logical tab order for interactive elements (email, password, login button)`

#### Router & Login Icon Integration Tests

*   **`ROUTER_CONFIGURATION` / Header Component:**
    *   `should render the HeaderComponent containing the Login icon`
*   **Login Icon Button:**
    *   `should navigate to /login when the login icon button is clicked`

### 2.2. Integration Test Scenarios

Integration tests will verify the end-to-end user flows, often mirroring the Gherkin Acceptance Criteria.

*   **Scenario: Navigate to Login Page via Icon (AC-1)**
    *   **Steps:**
        1.  User visits the application's root URL (`/`).
        2.  Assert that the `<button class="login-icon">` is visible.
        3.  Click the login icon button.
        4.  Assert that the URL changes to `/login`.
        5.  Assert that the `LoginPageComponent` is rendered.
*   **Scenario: Successful Login (AC-2)**
    *   **Steps:**
        1.  User navigates to `/login`.
        2.  Enter valid email "valid@example.com" into the email field.
        3.  Enter valid password "securePassword123" into the password field.
        4.  Assert that the "Log In" button is enabled.
        5.  (Mock API: `POST /api/login` responds with `200 OK` and a token)
        6.  Click the "Log In" button.
        7.  Assert that `localStorage.getItem('authToken')` contains the token.
        8.  Assert that the user is redirected to `/dashboard`.
*   **Scenario: Failed Login - Invalid Credentials (AC-3)**
    *   **Steps:**
        1.  User navigates to `/login`.
        2.  Enter "invalid@example.com" and "wrongpassword".
        3.  Assert that the "Log In" button is enabled.
        4.  (Mock API: `POST /api/login` responds with `401 Unauthorized`)
        5.  Click the "Log In" button.
        6.  Assert that "Invalid email or password." is displayed prominently.
        7.  Assert that the user remains on `/login`.
        8.  Assert that `localStorage.getItem('authToken')` is null.
*   **Scenario: Failed Login - Network/Server Error (AC-4)**
    *   **Steps:**
        1.  User navigates to `/login`.
        2.  Enter "user@example.com" and "securePassword123".
        3.  Assert that the "Log In" button is enabled.
        4.  (Mock API: `POST /api/login` responds with `500 Internal Server Error` or simulates network failure)
        5.  Click the "Log In" button.
        6.  Assert that "An unexpected error occurred. Please try again later." (or the more specific network message) is displayed prominently.
        7.  Assert that the user remains on `/login`.
        8.  Assert that `localStorage.getItem('authToken')` is null.
*   **Scenario: Client-Side Email Validation (AC-5)**
    *   **Steps:**
        1.  User navigates to `/login`.
        2.  Enter "invalid-email-format" into the email field.
        3.  Blur the email field.
        4.  Assert that "Please enter a valid email address." is displayed below the email field.
        5.  Enter a valid email "valid@example.com".
        6.  Blur the email field.
        7.  Assert that the email error message is no longer displayed.
*   **Scenario: Client-Side Password Validation (AC-6)**
    *   **Steps:**
        1.  User navigates to `/login`.
        2.  Enter "short" into the password field.
        3.  Blur the password field.
        4.  Assert that "Password must be at least 8 characters long." is displayed below the password field.
        5.  Enter a valid password "securePassword123".
        6.  Blur the password field.
        7.  Assert that the password error message is no longer displayed.
*   **Scenario: Login Button Disabled States (AC-7)**
    *   **Steps:**
        1.  User navigates to `/login`.
        2.  Assert that the "Log In" button is disabled.
        3.  Enter valid email, leave password empty. Assert button disabled.
        4.  Enter valid password, leave email empty. Assert button disabled.
        5.  Enter valid email, invalid password. Assert button disabled.
        6.  Enter invalid email, valid password. Assert button disabled.
        7.  Enter valid email, valid password. Assert button enabled.
*   **Scenario: Already Authenticated User Accesses /login**
    *   **Steps:**
        1.  (Precondition: `localStorage` already contains `authToken`)
        2.  User attempts to navigate to `/login` (e.g., by directly typing URL or clicking login icon).
        3.  Assert that the user is immediately redirected to `/dashboard`.
        4.  Assert that `LoginPageComponent` is not rendered.
*   **Scenario: Keyboard Navigation and Accessibility**
    *   **Steps:**
        1.  User navigates to root page.
        2.  Press `Tab`. Assert focus is on the Login Icon.
        3.  Click `Enter` on Login Icon. Assert URL is `/login`.
        4.  Press `Tab`. Assert focus is on Email Address field.
        5.  Type valid email. Press `Tab`. Assert focus is on Password field.
        6.  Type valid password. Press `Tab`. Assert focus is on "Log In" button.
        7.  Press `Enter` on "Log In" button. (Mock successful API call).
        8.  Assert user is redirected to `/dashboard`.
        9.  Repeat flow, testing password visibility toggle with keyboard (Space/Enter).
        10. Test error messages are announced by screen reader (simulated with `aria-live`).

## 3. Performance Optimization Suggestions

The architecture already leverages Vite for bundling/minification and CDNs for static asset delivery. Here are additional considerations specific to the Login Page:

1.  **Lazy Loading `LoginPageComponent`:**
    *   **Suggestion:** Implement React's `lazy` and `Suspense` for the `LoginPageComponent` and its dependencies. This ensures the login page's code is only loaded when a user actually navigates to `/login`, reducing the initial bundle size for the main application and contributing to faster initial page loads (NFR-001, PT-001) for users who might not log in immediately.
    *   **Impact:** Reduces initial JavaScript bundle size, improves Time to Interactive for the main app.
    *   **Hot Path:** Initial application load.

2.  **CSS Optimization:**
    *   **Suggestion:** Ensure only necessary CSS from `src/App.css` and `src/index.css` is applied to the login page. If new component-scoped styles are added, consider using CSS Modules or a similar solution to prevent style collisions and keep CSS bundles minimal. Vite handles CSS splitting/inlining, but component-scoped solutions help manage overall CSS weight.
    *   **Impact:** Faster page rendering, smaller CSS payload.
    *   **Hot Path:** Initial page load.

3.  **SVG Icon Optimization:**
    *   **Suggestion:** The login icon and password eye icon are SVGs. Ensure these SVGs are optimized (e.g., using `svgo`) to remove unnecessary metadata, comments, and whitespace, reducing their file size. Inline SVGs or use a sprite system where appropriate.
    *   **Impact:** Smaller network requests for images, faster rendering.
    *   **Hot Path:** Initial page load.

4.  **Debounce/Throttle Input Validation (Minor):**
    *   **Suggestion:** While current validation happens on blur or submit, if future requirements introduce real-time, character-by-character validation that is computationally intensive (e.g., password strength meter with complex regex), consider debouncing the validation calls to avoid excessive function executions and UI re-renders. For current spec, this is not a hot path.
    *   **Impact:** Prevents UI jank for complex real-time validation.
    *   **Hot Path:** Real-time input validation (if implemented).

5.  **Minimize Re-renders in `LoginPageComponent`:**
    *   **Suggestion:** Use `React.memo` for any child components within the `LoginPageComponent` that are pure and might receive props that don't frequently change. While the form itself is reactive, ensuring child components don't unnecessarily re-render can marginally improve performance. For a simple form, this is usually micro-optimization.
    *   **Impact:** Slightly faster UI updates.
    *   **Hot Path:** UI interaction.

6.  **Preload/Preconnect (Network Layer):**
    *   **Suggestion:** If the `Backend Authentication API` is hosted on a different domain, add `<link rel="preconnect" href="https://your-api-domain.com">` or `<link rel="dns-prefetch" href="https://your-api-domain.com">` to `index.html`. This can slightly speed up the initial API call by performing DNS lookup and TCP handshake proactively.
    *   **Impact:** Reduces initial API call latency (PT-003).
    *   **Hot Path:** Login submission.

## 4. Security Review Findings

The Architecture document provided a thorough security section. This review reiterates critical points and adds specific implementation-level checks.

1.  **HTTPS/TLS Enforcement (NFR-006):**
    *   **Finding:** Specified as mandatory. This is crucial for encrypting credentials in transit.
    *   **Recommendation:** Verify that both the frontend hosting (CDN) and the backend API gateway are configured to strictly enforce HTTPS, redirecting all HTTP traffic to HTTPS. Frontend code should always use `https://` for API calls.
    *   **Implementation Check:** Ensure `API_BASE_URL` in `AUTH_SERVICE` explicitly uses `https://`.

2.  **XSS Vulnerability with `localStorage` (C-006):**
    *   **Finding:** Acknowledged in the architecture. `localStorage` is vulnerable to XSS.
    *   **Recommendation:**
        *   **Implement a Strict Content Security Policy (CSP):** This is the strongest client-side defense against XSS. Configure `Content-Security-Policy` header in the hosting environment to restrict script sources, inline scripts, and other potentially malicious content.
        *   **Input Sanitization:** Ensure all dynamic content rendered anywhere in the application (even outside login) is properly sanitized/escaped to prevent XSS. For login, specifically, error messages displayed from the backend *must* be sanitized before rendering.
        *   **Backend Mitigation:** Advocate for short-lived tokens and refresh tokens (even if out of scope, a good practice). The backend should have robust rate limiting and account lockout.
    *   **Implementation Check:** Add CSP header configuration to deployment steps. Ensure any backend-originated messages displayed in `LoginPageComponent` are rendered safely (e.g., using React's safe rendering, not `dangerouslySetInnerHTML`).

3.  **Backend Validation (CRITICAL):**
    *   **Finding:** The frontend implements client-side validation (FR-009, FR-010). The architecture explicitly states, "Frontend validation... not for security. All validation rules must be strictly enforced on the server-side as well."
    *   **Recommendation:** Reiterate this critical point. The backend *must* re-validate all incoming `email` and `password` fields for format, length, and content before attempting authentication.
    *   **Implementation Check:** This is a backend responsibility, but important for frontend teams to be aware of and confirm with backend teams.

4.  **Rate Limiting and Account Lockout:**
    *   **Finding:** Mentioned in the architecture as a backend security measure.
    *   **Recommendation:** Confirm with backend team that `/api/login` endpoint has robust rate limiting to prevent brute-force attacks and account lockout mechanisms to protect user accounts.
    *   **Implementation Check:** N/A (backend responsibility), but crucial for overall security.

5.  **Password Masking (FR-003):**
    *   **Finding:** Characters entered into the password field must be masked.
    *   **Recommendation:** Ensure the `<input type="password">` is correctly used, and the optional "show password" toggle functionality is implemented securely (not revealing password in console/network logs if toggled).
    *   **Implementation Check:** Verify `type` attribute changes for password input, and that the value is always handled securely.

6.  **No Sensitive Information in Logs:**
    *   **Finding:** Observability section mentions logging, with a note "omitting sensitive data."
    *   **Recommendation:** Strictly enforce that raw passwords or full authentication tokens are NEVER logged to client-side console, server-side logs, or error reporting services (e.g., Sentry). Only log hashes or masked versions if necessary for debugging.
    *   **Implementation Check:** Code review `AuthService.LOGIN` and any logging mechanisms to ensure sensitive data is redacted.

7.  **Dependency Security:**
    *   **Finding:** Using React, Vite, `react-router-dom`, etc.
    *   **Recommendation:** Regular dependency scanning (e.g., `npm audit`, Snyk) should be part of the CI/CD pipeline to identify and mitigate known vulnerabilities in third-party libraries.
    *   **Implementation Check:** Integrate `npm audit` into `build` script or CI/CD.

## 5. Implementation Checklist

This checklist synthesizes all requirements, architectural decisions, and refinement findings into actionable items.

### 5.1. Project Setup & Dependencies

*   [ ] Install `react-router-dom`: `npm install react-router-dom@^6.x.x` (or latest compatible for React 19).
*   [ ] Verify React (19.2.6), TypeScript (~6.0.2), Vite (8.0.12) versions in `package.json`.
*   [ ] Ensure ESLint and Prettier are configured and run as part of the development and CI process.

### 5.2. Routing & Navigation

*   [ ] Create `src/router.tsx` (or similar) to configure `BrowserRouter` and define routes.
*   [ ] Define the `/login` route mapping to `<LoginPageComponent />`.
*   [ ] Define the `/dashboard` route mapping to `<DashboardPageComponent />` (placeholder).
*   [ ] Modify the existing `<button type="button" class="login-icon">` in the `HeaderComponent` (or equivalent) to use `useNavigate()` (from `react-router-dom`) to redirect to `/login` on click.
    *   [ ] Ensure the `login-icon` button retains its `type="button"`, `class="login-icon"`, `aria-label="Login"`, and `title="Login"` attributes.
    *   [ ] Ensure the SVG content of the login icon remains unchanged.

### 5.3. `LOGIN_PAGE_COMPONENT`

*   [ ] Create `src/components/LoginPage/LoginPage.tsx` for the main login form component.
*   [ ] Implement local state for `email`, `password`, `emailError`, `passwordError`, `loginError`, `isSubmitting`, and `showPassword`.
*   [ ] On component mount (`useEffect`), check if `AuthService.isAuthenticated()` returns `true`. If so, redirect to `/dashboard`.
*   [ ] Render a `FORM` element with `ON_SUBMIT` handler.

#### Input Fields

*   [ ] **Email Input (FR-002):**
    *   [ ] Label: "Email Address" (`<label>`).
    *   [ ] Type: `email`.
    *   [ ] `id` and `for` attributes for accessibility (`email-input`, `email-label`).
    *   [ ] `VALUE` bound to `email` state.
    *   [ ] `ON_CHANGE` handler (`handleInputChange`).
    *   [ ] `ON_BLUR` handler (`handleBlur`).
    *   [ ] `MAX_LENGTH="254"`.
    *   [ ] Apply existing `form-input` CSS class.
*   [ ] **Password Input (FR-003):**
    *   [ ] Label: "Password" (`<label>`).
    *   [ ] Type: Dynamically `password` or `text` based on `showPassword` state.
    *   [ ] `id` and `for` attributes for accessibility (`password-input`, `password-label`).
    *   [ ] `VALUE` bound to `password` state.
    *   [ ] `ON_CHANGE` handler (`handleInputChange`).
    *   [ ] `ON_BLUR` handler (`handleBlur`).
    *   [ ] `MIN_LENGTH="8"`.
    *   [ ] `MAX_LENGTH="64"`.
    *   [ ] Apply existing `form-input` CSS class.
*   [ ] **Password Visibility Toggle (UX Enhancement):**
    *   [ ] Implement a `<button type="button">` to toggle `showPassword` state.
    *   [ ] Include an eye SVG icon (ensure optimized SVG).
    *   [ ] Set `aria-label` dynamically ("Show password" / "Hide password").
    *   [ ] Set `tabIndex="-1"` for the toggle button to maintain logical tab order via input.

#### Client-Side Validation

*   [ ] Implement `validateEmailField(value: string)` function (using `ValidationService`).
*   [ ] Implement `validatePasswordField(value: string)` function.
*   [ ] `handleInputChange` should re-validate the respective field if an error is already showing, clearing `loginError`.
*   [ ] `handleBlur` should trigger validation for the blurred field.
*   [ ] Display email error message "Please enter a valid email address." (FR-009) below the email field using a `<p class="error-message" role="alert" aria-live="assertive">`.
*   [ ] Display password error message "Password must be at least 8 characters long." (FR-010) below the password field using a `<p class="error-message" role="alert" aria-live="assertive">`.
*   [ ] Add max length validation messages for email and password.

#### Login Button

*   [ ] Render "Log In" button (FR-004) with `type="submit"`.
*   [ ] Implement `isFormValid()` function to check email and password validity and non-emptiness.
*   [ ] Button `DISABLED` state: `NOT isFormValid() OR isSubmitting`.
*   [ ] Button text should be "Log In" or "Logging In..." based on `isSubmitting` state.

#### Authentication Submission

*   [ ] Implement `handleLoginSubmit` (async function).
*   [ ] Prevent default form submission.
*   [ ] Re-validate all fields on submission to catch any missed errors.
*   [ ] Set `isSubmitting = true`.
*   [ ] Call `AuthService.LOGIN({ email, password })`.
*   [ ] If `authResponse.success`:
    *   [ ] Call `AuthService.SET_LOCAL_STORAGE_ITEM("authToken", authResponse.token)` (FR-006).
    *   [ ] Redirect to `/dashboard` using `useNavigate()` (FR-006).
*   [ ] If `authResponse.status` is 401:
    *   [ ] Set `loginError = "Invalid email or password."` (FR-007).
*   [ ] For other API errors (5xx) or network errors (`catch` block):
    *   [ ] Set `loginError = "An unexpected error occurred. Please try again later."` (FR-008) or the more specific network message.
*   [ ] In `finally` block, set `isSubmitting = false`.
*   [ ] Display `loginError` prominently using a `<p class="api-error-message" role="alert" aria-live="assertive">`.

### 5.4. `AUTH_SERVICE` Module

*   [ ] Create `src/services/AuthService.ts`.
*   [ ] Define `UserCredentials` and `AuthResponse` types.
*   [ ] `API_BASE_URL` constant should use `https://`.
*   [ ] `LOGIN(credentials: UserCredentials)` function:
    *   [ ] Use `fetch` API for POST request to `/api/login`.
    *   [ ] Set `Content-Type: application/json` header.
    *   [ ] Implement `try...catch` for `fetch` to handle network errors.
    *   [ ] Map HTTP status codes (200, 401, 400, 5xx) to `AuthResponse` with appropriate `success`, `token`, `status`, and `message`.
    *   [ ] Ensure specific network error message is returned from `catch` block.
*   [ ] `SET_LOCAL_STORAGE_ITEM(key: string, value: string)`:
    *   [ ] Wrap `window.localStorage.setItem` in a `try...catch` block to handle `QuotaExceededError` or `SecurityError`. Log errors but do not crash the app.
*   [ ] `GET_LOCAL_STORAGE_ITEM(key: string)`: Wrapper for `window.localStorage.getItem`.
*   [ ] `REMOVE_LOCAL_STORAGE_ITEM(key: string)`: Wrapper for `window.localStorage.removeItem`.
*   [ ] `IS_AUTHENTICATED()`: Wrapper for checking `AUTH_TOKEN_KEY` in `localStorage`.

### 5.5. `VALIDATION_SERVICE` Module

*   [ ] Create `src/services/ValidationService.ts`.
*   [ ] `IS_VALID_EMAIL_FORMAT(email: string)`: Implement email regex validation (FR-009).

### 5.6. Styling & Accessibility

*   [ ] Ensure all Login Page components strictly reuse existing CSS classes from `src/App.css` and `src/index.css` (NFR-003, C-003).
*   [ ] Use logical DOM order for input fields and buttons to support natural keyboard navigation. Avoid explicit `tabIndex` values unless strictly necessary for custom focus management. (NFR-004)
*   [ ] Implement ARIA attributes (`aria-label`, `aria-describedby`, `aria-invalid`, `role="alert"`, `aria-live="assertive"`, `aria-busy`) for all interactive elements and error messages (NFR-005).

### 5.7. Testing

*   [ ] Write comprehensive **Unit Tests** for `ValidationService`, `AuthService`, and `LoginPageComponent` (following the test cases defined in Section 2.1).
*   [ ] Write **Integration Tests** (using Testing Library) to cover all Acceptance Criteria scenarios (Section 2.2).
*   [ ] Implement **End-to-End (E2E) Tests** (e.g., with Cypress or Playwright) for the critical user journey (navigate, login success, login failure).

### 5.8. Performance & Observability

*   [ ] Implement **Lazy Loading** for the `LoginPageComponent` using `React.lazy()` and `Suspense` in the router configuration.
*   [ ] Optimize any new SVG assets (e.g., password eye icon).
*   [ ] Add `preconnect` or `dns-prefetch` links for the API domain in `index.html` if cross-domain.
*   [ ] Integrate client-side logging (e.g., `console.error`, `console.warn`) for development.
*   [ ] Ensure `AuthService.LOGIN` measures API response time and logs to a monitoring system (placeholder for RUM/APM integration, PT-003).
*   [ ] Implement event tracking for login success/failure rates (SM-001, SM-003) to an analytics platform.
*   [ ] Integrate an error reporting tool (e.g., Sentry) to catch unhandled JavaScript errors in `LoginPageComponent`.
*   [ ] Configure CI/CD to monitor frontend bundle size increase (PT-004).

### 5.9. Security Enhancements

*   [ ] Implement a robust **Content Security Policy (CSP)** header in the deployment environment to mitigate XSS attacks.
*   [ ] Ensure all error messages from the backend are **sanitized** before being rendered in the `LoginPageComponent` to prevent XSS.
*   [ ] **Never log sensitive data** (raw passwords, full tokens) to console, backend logs, or monitoring services.
*   [ ] Confirm with backend team that HTTPS/TLS is enforced, server-side validation is robust, and rate limiting/account lockout is in place for `/api/login`.
*   [ ] Integrate dependency scanning (e.g., `npm audit`) into CI/CD.

---