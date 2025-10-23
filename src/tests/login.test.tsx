/**
 * @jest-environment jsdom
 */
import type * as AuthModule from "~/components/auth";
import { handleSignIn } from "~/components/auth";
import Login from "~/pages/login";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("~/components/auth", () => {
  const actual = jest.requireActual<typeof AuthModule>("~/components/auth");
  return {
    ...actual,
    AuthLayout: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    handleSignIn: jest.fn(),
  };
});

const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}));

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders login form", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it("calls handleSignIn and redirects on successful login", async () => {
    (handleSignIn as jest.Mock).mockResolvedValue({ ok: true });

    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "pass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(handleSignIn).toHaveBeenCalledWith("test@example.com", "pass123");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
  it("shows error message on failed login", async () => {
    (handleSignIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: "Failed",
    });

    render(<Login />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(handleSignIn).toHaveBeenCalledWith(
        "wrong@example.com",
        "wrongpass"
      );
      expect(
        screen.getByText("Incorrect Email and/or Password")
      ).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
