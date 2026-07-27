import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginPage from "../LoginPage";
import { AuthProvider } from "../auth/AuthContext";

// Utilities to mock SSO and backend API calls
const ssoEnabled = true;
const ssoDisabled = false;

// Mock navigation
function renderWithProviders(
  ui: React.ReactElement,
  {
    route = "/login",
    ssoEnabledValue = true,
    onLoginSuccess = jest.fn(),
  }: {
    route?: string;
    ssoEnabledValue?: boolean;
    onLoginSuccess?: () => void;
  } = {}
) {
  // AuthContext stub: for controlling state in tests
  const mockAuthContext = {
    isAuthenticated: false,
    login: jest.fn(() => Promise.resolve()),
    ssoLogin: jest.fn(() => Promise.resolve({ success: true })),
    ssoEnabled: ssoEnabledValue,
    loading: false,
    error: null,
    setError: jest.fn(),
    onLoginSuccess,
  };

  return render(
    <AuthProvider value={mockAuthContext as any}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Adding profile/home for navigation checks */}
          <Route path="/profile" element={<div data-testid="profile-page">Profile Page</div>} />
          <Route path="/home" element={<div data-testid="home-page">Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

// Mock window.location.assign and replace
let originalLocation: Location;
beforeAll(() => {
  originalLocation = window.location;
  // @ts-ignore
  delete window.location;
  // Use a dummy object to mock navigation for SSO popup redirect
  window.location = { assign: jest.fn(), replace: jest.fn(), ...originalLocation };
});
afterAll(() => {
  window.location = originalLocation;
});

describe("LoginPage - SSO and legacy UI/UX", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders SSO button when SSO is enabled", () => {
    renderWithProviders(<LoginPage />, { ssoEnabledValue: ssoEnabled });

    expect(screen.getByRole("button", { name: /sign in with/i })).toBeInTheDocument();
  });

  it("does not render SSO button when SSO is disabled", () => {
    renderWithProviders(<LoginPage />, { ssoEnabledValue: ssoDisabled });

    expect(screen.queryByRole("button", { name: /sign in with/i })).not.toBeInTheDocument();
  });

  it("contains legacy email/mobile+password fields and submit button", () => {
    renderWithProviders(<LoginPage />, { ssoEnabledValue: ssoEnabled });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in|log ?in/i })).toBeInTheDocument();
  });

  it("successfully logs in via legacy login and redirects", async () => {
    const mockLogin = jest.fn(() => Promise.resolve({ success: true }));
    const mockOnSuccess = jest.fn();

    renderWithProviders(<LoginPage />, {
      ssoEnabledValue: ssoEnabled,
      onLoginSuccess: mockOnSuccess,
    });

    // Fill out legacy form and submit
    userEvent.type(screen.getByLabelText(/email/i), "user@example.com");
    userEvent.type(screen.getByLabelText(/password/i), "ValidPassword123");

    const submitBtn = screen.getByRole("button", { name: /sign in|log ?in/i });
    userEvent.click(submitBtn);

    // Wait for navigation to happen, e.g., redirect (fake: should call the onLoginSuccess callback or change route)
    await waitFor(() =>
      expect(screen.queryByTestId("profile-page") || screen.queryByTestId("home-page")).toBeInTheDocument()
    );
  });

  it("shows field errors if legacy login fails (regression)", async () => {
    const expectedError = "Invalid credentials";
    const mockLogin = jest.fn(() => Promise.reject(new Error(expectedError)));

    renderWithProviders(<LoginPage />, { ssoEnabledValue: ssoEnabled });

    userEvent.type(screen.getByLabelText(/email/i), "bad@invalid.com");
    userEvent.type(screen.getByLabelText(/password/i), "badpswd");
    userEvent.click(screen.getByRole("button", { name: /sign in|log ?in/i }));

    // Error UI should show
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("initiates SSO login and redirects on success", async () => {
    const mockOnSuccess = jest.fn();

    renderWithProviders(<LoginPage />, {
      ssoEnabledValue: ssoEnabled,
      onLoginSuccess: mockOnSuccess,
    });

    const ssoBtn = screen.getByRole("button", { name: /sign in with/i });
    userEvent.click(ssoBtn);

    // Simulate SSO popup/redirect flow and success
    await waitFor(() =>
      expect(screen.queryByTestId("profile-page") || screen.queryByTestId("home-page")).toBeInTheDocument()
    );
  });

  it("shows generic error on SSO authentication failure", async () => {
    // Simulate AuthContext.ssoLogin rejects
    const expectedError = "Authentication failed. Please try again.";
    const mockAuthContext = {
      isAuthenticated: false,
      login: jest.fn(() => Promise.resolve()),
      ssoLogin: jest.fn(() => Promise.reject(new Error("provider error"))),
      ssoEnabled: true,
      loading: false,
      error: null,
      setError: jest.fn(),
      onLoginSuccess: jest.fn(),
    };

    render(
      <AuthProvider value={mockAuthContext as any}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const ssoBtn = screen.getByRole("button", { name: /sign in with/i });
    userEvent.click(ssoBtn);

    // Generic error: "Authentication failed. Please try again."
    await waitFor(() => {
      expect(
        screen.getByText(/authentication failed\. please try again\./i)
      ).toBeInTheDocument();
    });
  });

  it("renders both SSO and legacy login options for regression check", () => {
    renderWithProviders(<LoginPage />, { ssoEnabledValue: ssoEnabled });

    // SSO button and legacy login fields present
    expect(screen.getByRole("button", { name: /sign in with/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("does not regress legacy fields/UX with SSO feature present", () => {
    renderWithProviders(<LoginPage />, { ssoEnabledValue: ssoEnabled });

    // Submit button, form, links still there
    expect(screen.getByRole("form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in|log ?in/i })).toBeInTheDocument();
    // No UI elements are missing compared to legacy-only login
  });

  it("shows no provider-specific error details if SSO fails", async () => {
    // Simulate SSO error leaking backend/provider error
    const mockAuthContext = {
      isAuthenticated: false,
      login: jest.fn(() => Promise.resolve()),
      ssoLogin: jest.fn(() => Promise.reject(new Error("OAuth error: bad client id"))),
      ssoEnabled: true,
      loading: false,
      error: null,
      setError: jest.fn(),
      onLoginSuccess: jest.fn(),
    };

    render(
      <AuthProvider value={mockAuthContext as any}>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const ssoBtn = screen.getByRole("button", { name: /sign in with/i });
    userEvent.click(ssoBtn);

    await waitFor(() => {
      // Should display only the generic error, not the provider error string
      expect(
        screen.queryByText(/oauth error|client id|google|microsoft/i)
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(/authentication failed\. please try again\./i)
      ).toBeInTheDocument();
    });
  });
});