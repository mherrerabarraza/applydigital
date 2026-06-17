The following pseudocode details the algorithms for the Login Page, adhering to the specified functional and non-functional requirements, constraints, and data models.

---

## 1. Top-Level Application Routing and Login Icon Integration

This section describes the high-level setup for routing and how the existing login icon is modified to navigate to the new login page.

### 1.1. `ROUTER_CONFIGURATION` Algorithm

**Purpose:** To set up client-side routing using a library like `react-router-dom` and define the `/login` route. Also, to integrate the navigation functionality into the existing `<button type="button" class="login-icon">` element.

**Data Structures:**
*   **Routes Array:** An array of objects, where each object defines a `path` (string) and an `element` (React component or equivalent).
*   **Navigation Function:** Provided by the routing library, typically `NAVIGATE(path: string)`.

**Algorithm:**

```pseudocode
PROCEDURE ROUTER_CONFIGURATION()
    // Constraint C-005: Integrate a client-side routing library (e.g., React Router DOM)

    // 1. Initialize the Router context for the application
    DECLARE BrowserRouterComponent = NEW BROWSER_ROUTER_COMPONENT()

    // 2. Define the application's routes
    DECLARE RoutesDefinition = [
        { PATH: "/", ELEMENT: <HOME_PAGE_COMPONENT /> },
        { PATH: "/login", ELEMENT: <LOGIN_PAGE_COMPONENT /> }, // FR-001: Dedicated login page at /login
        { PATH: "/dashboard", ELEMENT: <DASHBOARD_PAGE_COMPONENT /> }
        // Add other application routes here
    ]

    // 3. Render the main application structure
    RENDER BrowserRouterComponent WITH {
        CHILDREN: <GLOBAL_APP_LAYOUT_COMPONENT> // A wrapper component for common layout elements (e.g., Header, Footer)
            <HEADER_COMPONENT>
                // Constraint C-002: Modify existing login icon to navigate
                <LOGIN_ICON_BUTTON
                    TYPE="button"
                    CLASS="login-icon"
                    ARIA_LABEL="Login"
                    TITLE="Login"
                    ON_CLICK: NAVIGATE_TO_LOGIN_PAGE // Call navigation subroutine
                >
                    <SVG_CONTENT_OF_LOGIN_ICON /> // Existing SVG content
                </LOGIN_ICON_BUTTON>
                // Other header elements
            </HEADER_COMPONENT>
            <MAIN_CONTENT_AREA>
                // Render the component corresponding to the current URL path
                <ROUTES_RENDERER routes={RoutesDefinition} />
            </MAIN_CONTENT_AREA>
            <FOOTER_COMPONENT />
        </GLOBAL_APP_LAYOUT_COMPONENT>
    }
END PROCEDURE

// Subroutine for handling login icon click
PROCEDURE NAVIGATE_TO_LOGIN_PAGE()
    NAVIGATE("/login") // Redirects the user to the /login page (FR-001)
END PROCEDURE
```

**Time Complexity:**
*   `ROUTER_CONFIGURATION`: O(N) where N is the number of defined routes, during initial application load. Subsequent route matching is typically O(log N) or O(N) depending on the routing algorithm, but very fast in practice.
*   `NAVIGATE_TO_LOGIN_PAGE`: O(1).

**Space Complexity:**
*   `ROUTER_CONFIGURATION`: O(N) for storing the routes definition.
*   `NAVIGATE_TO_LOGIN_PAGE`: O(1).

**Design Pattern:**
*   **Router Pattern:** Centralized management of application navigation.
*   **Component-Based Architecture:** Encapsulation of UI elements and their behavior.

---

## 2. Login Page Component

This component handles the rendering of the login form, local state management, client-side validation, and interaction with the authentication service.

### 2.1. `LOGIN_PAGE_COMPONENT` Algorithm

**Purpose:** To render the login form, manage input fields, display validation and authentication errors, and handle the login submission process.

**Data Structures:**
*   **Component State Variables (Local):**
    *   `email`: `string` (initial: `""`) - User's entered email.
    *   `password`: `string` (initial: `""`) - User's entered password.
    *   `emailError`: `string` (initial: `""`) - Client-side validation message for email.
    *   `passwordError`: `string` (initial: `""`) - Client-side validation message for password.
    *   `loginError`: `string` (initial: `""`) - Generic error message for failed backend authentication (FR-007, FR-008).
    *   `isSubmitting`: `boolean` (initial: `FALSE`) - Indicates if login request is in progress, used to disable button.
    *   `showPassword`: `boolean` (initial: `FALSE`) - Toggles password field visibility (UX feature, not explicitly required by FRs but good practice).
*   **`UserCredentials` Object:** { `email`: string, `password`: string } - Used for API request body.
*   **`AuthResponse` Object:** { `success`: boolean, `token`: string | NULL, `status`: number, `message`: string | NULL } - Used for API response handling.
*   **`localStorage`:** For storing the `authToken` (FR-006, C-006).

**Subroutines:**
*   `HANDLE_INPUT_CHANGE(field: string, value: string)`: Updates state for email/password and clears `loginError`.
*   `HANDLE_BLUR(field: string)`: Triggers client-side validation for a specific field when it loses focus (FR-009, FR-010).
*   `VALIDATE_EMAIL_FIELD(emailValue: string)`: Performs email format and length validation.
*   `VALIDATE_PASSWORD_FIELD(passwordValue: string)`: Performs password length validation.
*   `IS_FORM_VALID()`: Checks if both email and password fields have valid, non-empty inputs (FR-004).
*   `HANDLE_LOGIN_SUBMIT()`: Orchestrates the authentication request to the backend.

**Algorithm:**

```pseudocode
COMPONENT LOGIN_PAGE_COMPONENT()
    // Initialize state variables
    STATE email = ""
    STATE password = ""
    STATE emailError = ""
    STATE passwordError = ""
    STATE loginError = ""
    STATE isSubmitting = FALSE
    STATE showPassword = FALSE

    // Effect hook to check for existing token on component mount
    EFFECT ON_MOUNT
        IF AUTH_SERVICE.GET_LOCAL_STORAGE_ITEM("authToken") IS NOT NULL THEN
            NAVIGATE("/dashboard") // Redirect if already authenticated
        END IF
    END EFFECT

    // --- Subroutines for event handlers and validation ---

    PROCEDURE HANDLE_INPUT_CHANGE(field: string, value: string)
        IF field IS "email" THEN
            SET email = value
            IF emailError IS NOT EMPTY THEN // Re-validate if an error was previously displayed
                SET emailError = VALIDATE_EMAIL_FIELD(value)
            END IF
        ELSE IF field IS "password" THEN
            SET password = value
            IF passwordError IS NOT EMPTY THEN // Re-validate if an error was previously displayed
                SET passwordError = VALIDATE_PASSWORD_FIELD(value)
            END IF
        END IF
        SET loginError = "" // Clear any previous API-level errors on new input
    END PROCEDURE

    PROCEDURE HANDLE_BLUR(field: string)
        // FR-009, FR-010: Real-time validation on blur
        IF field IS "email" THEN
            SET emailError = VALIDATE_EMAIL_FIELD(email)
        ELSE IF field IS "password" THEN
            SET passwordError = VALIDATE_PASSWORD_FIELD(password)
        END IF
    END PROCEDURE

    FUNCTION VALIDATE_EMAIL_FIELD(emailValue: string) RETURNS string
        // FR-009: Client-side email validation
        IF emailValue IS EMPTY THEN
            RETURN "" // No error message if field is empty (validation triggers on blur/submit)
        ELSE IF LENGTH(emailValue) > 254 THEN // FR-002: Max length
            RETURN "Email address is too long (max 254 characters)."
        ELSE IF NOT VALIDATION_SERVICE.IS_VALID_EMAIL_FORMAT(emailValue) THEN
            RETURN "Please enter a valid email address."
        END IF
        RETURN "" // Valid
    END FUNCTION

    FUNCTION VALIDATE_PASSWORD_FIELD(passwordValue: string) RETURNS string
        // FR-010: Client-side password validation (min length)
        IF passwordValue IS EMPTY THEN
            RETURN "" // No error message if field is empty (validation triggers on blur/submit)
        ELSE IF LENGTH(passwordValue) < 8 THEN // FR-003, FR-010: Min length
            RETURN "Password must be at least 8 characters long."
        ELSE IF LENGTH(passwordValue) > 64 THEN // FR-003: Max length
            RETURN "Password is too long (max 64 characters)."
        END IF
        RETURN "" // Valid
    END FUNCTION

    FUNCTION IS_FORM_VALID() RETURNS boolean
        // FR-004: Login button enablement logic
        // Button is enabled only when both fields contain valid AND non-empty input
        RETURN (email IS NOT EMPTY AND VALIDATE_EMAIL_FIELD(email) IS EMPTY) AND
               (password IS NOT EMPTY AND VALIDATE_PASSWORD_FIELD(password) IS EMPTY)
    END FUNCTION

    ASYNC PROCEDURE HANDLE_LOGIN_SUBMIT()
        // Prevent default form submission behavior
        PREVENT_DEFAULT_EVENT()

        // Re-validate all fields on submit to ensure latest state
        SET emailError = VALIDATE_EMAIL_FIELD(email)
        SET passwordError = VALIDATE_PASSWORD_FIELD(password)
        SET loginError = "" // Clear previous API error

        IF NOT IS_FORM_VALID() THEN
            // If client-side validation fails, do not proceed with API call
            RETURN
        END IF

        SET isSubmitting = TRUE

        TRY
            DECLARE credentials = { email: email, password: password }
            DECLARE authResponse = AWAIT AUTH_SERVICE.LOGIN(credentials) // FR-005: Send auth request

            IF authResponse.success THEN
                AUTH_SERVICE.SET_LOCAL_STORAGE_ITEM("authToken", authResponse.token) // FR-006: Store token
                NAVIGATE("/dashboard") // FR-006: Redirect to dashboard
            ELSE IF authResponse.status IS 401 THEN
                SET loginError = "Invalid email or password." // FR-007: Invalid credentials error
            ELSE
                SET loginError = "An unexpected error occurred. Please try again later." // FR-008: Generic error
            END IF
        CATCH error
            // Catch network errors or other unexpected issues
            SET loginError = "An unexpected error occurred. Please try again later." // FR-008
        FINALLY
            SET isSubmitting = FALSE // Re-enable button
        END TRY
    END PROCEDURE

    // --- Render Logic (JSX equivalent with accessibility attributes) ---

    RENDER
        <DIV CLASS="login-page-container"> // Apply existing app styles (NFR-003, C-003)
            <FORM ON_SUBMIT: HANDLE_LOGIN_SUBMIT>
                <H2>Log In</H2>

                {/* Email Input Field (FR-002, FR-009) */}
                <DIV CLASS="form-group">
                    <LABEL ID="email-label" FOR="email-input">Email Address</LABEL>
                    <INPUT
                        TYPE="email"
                        ID="email-input"
                        CLASS="form-input"
                        VALUE={email}
                        ON_CHANGE: (e) => HANDLE_INPUT_CHANGE("email", e.target.value)
                        ON_BLUR: (e) => HANDLE_BLUR("email")
                        MAX_LENGTH="254"
                        ARIA_REQUIRED="true"
                        ARIA_INVALID={emailError IS NOT EMPTY ? "true" : "false"} // NFR-005
                        ARIA_DESCRIBED_BY={emailError IS NOT EMPTY ? "email-error-message" : NULL} // NFR-005
                        TAB_INDEX="1" // NFR-004: Logical tab order
                    />
                    IF emailError IS NOT EMPTY THEN
                        <P ID="email-error-message" CLASS="error-message" ROLE="alert" ARIA_LIVE="assertive">{emailError}</P> // FR-009, NFR-005
                    END IF
                </DIV>

                {/* Password Input Field (FR-003, FR-010) */}
                <DIV CLASS="form-group">
                    <LABEL ID="password-label" FOR="password-input">Password</LABEL>
                    <DIV CLASS="password-input-wrapper">
                        <INPUT
                            TYPE={showPassword ? "text" : "password"} // FR-003: Characters masked
                            ID="password-input"
                            CLASS="form-input"
                            VALUE={password}
                            ON_CHANGE: (e) => HANDLE_INPUT_CHANGE("password", e.target.value)
                            ON_BLUR: (e) => HANDLE_BLUR("password")
                            MIN_LENGTH="8" // FR-003
                            MAX_LENGTH="64" // FR-003
                            ARIA_REQUIRED="true"
                            ARIA_INVALID={passwordError IS NOT EMPTY ? "true" : "false"} // NFR-005
                            ARIA_DESCRIBED_BY={passwordError IS NOT EMPTY ? "password-error-message" : NULL} // NFR-005
                            TAB_INDEX="2" // NFR-004
                        />
                        <BUTTON
                            TYPE="button"
                            CLASS="toggle-password-visibility"
                            ON_CLICK: () => SET showPassword = NOT showPassword
                            ARIA_LABEL={showPassword ? "Hide password" : "Show password"} // NFR-005
                            TAB_INDEX="-1" // Keep out of tab order if input already handles tabbing
                        >
                            <SVG_EYE_ICON isVisible={showPassword} />
                        </BUTTON>
                    </DIV>
                    IF passwordError IS NOT EMPTY THEN
                        <P ID="password-error-message" CLASS="error-message" ROLE="alert" ARIA_LIVE="assertive">{passwordError}</P> // FR-010, NFR-005
                    END IF
                </DIV>

                {/* API-level Error Display (FR-007, FR-008) */}
                IF loginError IS NOT EMPTY THEN
                    <P CLASS="api-error-message" ROLE="alert" ARIA_LIVE="assertive">{loginError}</P> // NFR-005
                END IF

                {/* Login Button (FR-004) */}
                <BUTTON
                    TYPE="submit"
                    CLASS="login-button"
                    DISABLED={NOT IS_FORM_VALID() OR isSubmitting} // FR-004: Disabled by default, enabled on valid input
                    ARIA_BUSY={isSubmitting ? "true" : "false"} // NFR-005
                    ARIA_LIVE="polite" // NFR-005
                    TAB_INDEX="3" // NFR-004
                >
                    IF isSubmitting THEN
                        "Logging In..."
                    ELSE
                        "Log In" // FR-004
                    END IF
                </BUTTON>
            </FORM>
        </DIV>
    END RENDER
END COMPONENT
```

**Time Complexity:**
*   `HANDLE_INPUT_CHANGE`, `HANDLE_BLUR`: O(L) where L is the length of the input string, due to validation calls.
*   `VALIDATE_EMAIL_FIELD`, `VALIDATE_PASSWORD_FIELD`: O(L) for string length checks and regex matching.
*   `IS_FORM_VALID`: O(L) as it calls validation functions.
*   `HANDLE_LOGIN_SUBMIT`: Dominated by the asynchronous `AUTH_SERVICE.LOGIN` call, which is network-bound. Local operations are O(1). Overall: O(L) + Network_Latency.
*   **Rendering:** Initial render and updates are typically O(Number of interactive elements) due to React's reconciliation, which is very efficient for a small form like this.

**Space Complexity:**
*   O(1) for storing component state variables and constants.

**Design Patterns:**
*   **State Pattern (Implicit):** React's `useState` hook effectively manages the component's internal state transitions.
*   **Strategy Pattern:** `VALIDATE_EMAIL_FIELD` and `VALIDATE_PASSWORD_FIELD` encapsulate validation logic, which can be extended or swapped.
*   **Component Pattern:** The `LOGIN_PAGE_COMPONENT` is a self-contained UI unit.

**Edge Cases & Error Handling:**
*   **Empty fields:** Validation messages are shown on blur or submit.
*   **Invalid email format:** Handled by `VALIDATE_EMAIL_FIELD` (FR-009).
*   **Password too short:** Handled by `VALIDATE_PASSWORD_FIELD` (FR-010).
*   **Max lengths exceeded:** Handled by `VALIDATE_EMAIL_FIELD` and `VALIDATE_PASSWORD_FIELD` (FR-002, FR-003).
*   **Incorrect credentials (401):** Display specific error message (FR-007).
*   **Server/Network errors (5xx, connection issues):** Display generic error message (FR-008).
*   **Already authenticated:** Redirects to `/dashboard` on page load.
*   **Button disabled state:** Correctly handles `isSubmitting` and `IS_FORM_VALID` (FR-004).

---

## 3. Authentication Service Module

This module abstracts the interaction with the backend authentication API and manages token storage.

### 3.1. `AUTH_SERVICE` Module

**Purpose:** To provide functions for authenticating users against the backend API and managing the authentication token in `localStorage`.

**Data Structures:**
*   **`UserCredentials` Interface:** { `email`: string, `password`: string }
*   **`AuthResponse` Interface:** { `success`: boolean, `token`: string | NULL, `status`: number, `message`: string | NULL }
*   **Constants:** `API_BASE_URL`, `LOGIN_ENDPOINT`, `AUTH_TOKEN_KEY`.

**Input:**
*   `credentials: UserCredentials` for `LOGIN`.
*   `key: string, value: string` for `SET_LOCAL_STORAGE_ITEM`.
*   `key: string` for `GET_LOCAL_STORAGE_ITEM`, `REMOVE_LOCAL_STORAGE_ITEM`.

**Output:**
*   `AuthResponse` for `LOGIN`.
*   `string | NULL` for `GET_LOCAL_STORAGE_ITEM`.
*   `boolean` for `IS_AUTHENTICATED`.

**Algorithm:**

```pseudocode
MODULE AUTH_SERVICE
    CONSTANT API_BASE_URL = "https://your-api-domain.com" // From API Contract
    CONSTANT LOGIN_ENDPOINT = "/api/login"
    CONSTANT AUTH_TOKEN_KEY = "authToken" // FR-006, C-006

    TYPE UserCredentials = {
        email: string,
        password: string
    }

    TYPE AuthResponse = {
        success: boolean,
        token: string OR NULL,
        status: number, // HTTP status code for detailed handling
        message: string OR NULL
    }

    ASYNC FUNCTION LOGIN(credentials: UserCredentials) RETURNS AuthResponse
        // FR-005: Sends authentication request to backend API
        TRY
            DECLARE requestBody = JSON.STRINGIFY(credentials)
            DECLARE response = AWAIT FETCH(API_BASE_URL + LOGIN_ENDPOINT, {
                METHOD: "POST",
                HEADERS: {
                    "Content-Type": "application/json"
                    // NFR-006: HTTPS/TLS is handled by deployment environment, not code logic
                },
                BODY: requestBody
            })

            DECLARE responseData = { message: NULL, token: NULL }
            TRY
                responseData = AWAIT response.JSON()
            CATCH jsonError
                // Handle cases where response body is not valid JSON
                LOG_WARN("Non-JSON response from API:", jsonError)
            END TRY

            IF response.OK THEN // HTTP status 200-299
                RETURN {
                    success: TRUE,
                    token: responseData.token, // Expects 'token' field (FR-006)
                    status: response.status,
                    message: responseData.message OR "Login successful"
                }
            ELSE IF response.status IS 401 THEN // API Contract: Invalid Credentials (FR-007)
                RETURN {
                    success: FALSE,
                    token: NULL,
                    status: response.status,
                    message: responseData.message OR "Invalid email or password."
                }
            ELSE // Other error statuses like 400 Bad Request, 5xx Server Error (FR-008)
                RETURN {
                    success: FALSE,
                    token: NULL,
                    status: response.status,
                    message: responseData.message OR "An unexpected error occurred. Please try again later."
                }
            END IF
        CATCH networkError
            // Catches actual network failures (e.g., no internet, DNS resolution failure)
            LOG_ERROR("Network error during login:", networkError)
            RETURN {
                success: FALSE,
                token: NULL,
                status: 0, // Indicate no HTTP status received
                message: "An unexpected network error occurred. Please check your internet connection and try again."
            }
        END TRY
    END FUNCTION

    PROCEDURE SET_LOCAL_STORAGE_ITEM(key: string, value: string)
        CALL `window.localStorage.setItem(key, value)`
    END PROCEDURE

    FUNCTION GET_LOCAL_STORAGE_ITEM(key: string) RETURNS string OR NULL
        RETURN CALL `window.localStorage.getItem(key)`
    END FUNCTION

    PROCEDURE REMOVE_LOCAL_STORAGE_ITEM(key: string)
        CALL `window.localStorage.removeItem(key)`
    END PROCEDURE

    FUNCTION IS_AUTHENTICATED() RETURNS boolean
        RETURN GET_LOCAL_STORAGE_ITEM(AUTH_TOKEN_KEY) IS NOT NULL
    END FUNCTION

END MODULE
```

**Time Complexity:**
*   `LOGIN`: Dominated by the `FETCH` network request. This is highly variable based on network conditions and backend processing time (NFR-002, PT-003 target < 1.5 seconds). Local operations (JSON parsing, object creation) are O(L) where L is response body size, typically O(1) for small responses.
*   `SET_LOCAL_STORAGE_ITEM`, `GET_LOCAL_STORAGE_ITEM`, `REMOVE_LOCAL_STORAGE_ITEM`, `IS_AUTHENTICATED`: All are O(1) as `localStorage` operations are highly optimized.

**Space Complexity:**
*   O(1) for module constants and temporary variables. `localStorage` uses client-side disk space.

**Design Patterns:**
*   **Facade Pattern:** `AUTH_SERVICE` provides a simplified interface for interacting with the complex underlying `fetch` API and `localStorage`.
*   **Service Layer Pattern:** Separates business logic (authentication) from UI components.

---

## 4. Validation Service Module

This module encapsulates reusable client-side validation logic.

### 4.1. `VALIDATION_SERVICE` Module

**Purpose:** To centralize and provide helper functions for common validation tasks, specifically email format validation (FR-009).

**Data Structures:**
*   **Constants:** `EMAIL_REGEX` (Regular Expression).

**Input:**
*   `email: string` for `IS_VALID_EMAIL_FORMAT`.

**Output:**
*   `boolean` for `IS_VALID_EMAIL_FORMAT`.

**Algorithm:**

```pseudocode
MODULE VALIDATION_SERVICE
    // FR-009: Standard email format regex
    CONSTANT EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    FUNCTION IS_VALID_EMAIL_FORMAT(email: string) RETURNS boolean
        // Tests if the given email string matches the standard email format regex
        RETURN REGEX_TEST(EMAIL_REGEX, email)
    END FUNCTION

    // Other validation functions could be added here if needed, e.g., for password strength beyond length.

END MODULE
```

**Time Complexity:**
*   `IS_VALID_EMAIL_FORMAT`: O(L) where L is the length of the email string, due to the regular expression matching.

**Space Complexity:**
*   O(1) for storing the regex constant.

**Design Patterns:**
*   **Utility Pattern:** Provides a collection of stateless, reusable functions.

---

**Summary of Data Structures Justification:**

1.  **Component State Variables (`useState`):**
    *   **Justification:** Essential for reactive UI development in React. They allow the UI to update automatically in response to user input, validation checks, and API responses. This is the optimal approach for managing dynamic UI elements and user interaction flow within a component.
    *   **Complexity:** Access and updates are O(1), leading to efficient re-renders.

2.  **`UserCredentials` / `AuthResponse` Objects (Interfaces/Types):**
    *   **Justification:** These simple, structured objects facilitate clear communication between components and services, especially for API requests and responses. They enforce type safety (with TypeScript) and improve code readability, ensuring that data is consistently formatted as per the `API Contracts` section.
    *   **Complexity:** Creation, access, and manipulation are O(1).

3.  **`localStorage`:**
    *   **Justification:** Explicitly specified in FR-006 and C-006 for persisting the `authToken`. It allows the authentication token to survive browser tab closures or even restarts, enabling persistent user sessions without needing re-login. It's a standard, widely supported browser API for client-side key-value storage.
    *   **Complexity:** `setItem`, `getItem`, `removeItem` are highly optimized by browsers, typically performing as O(1) operations.

4.  **Regular Expression (`EMAIL_REGEX`):**
    *   **Justification:** The most concise and efficient way to perform pattern matching for email format validation (FR-009). It's a core tool for string validation logic.
    *   **Complexity:** Matching a string against a regex is O(L) where L is the length of the string, as each character might be evaluated.

These chosen data structures and algorithms collectively fulfill all functional and non-functional requirements by providing clear structure, efficient processing, robust error handling, and adherence to performance and accessibility standards.