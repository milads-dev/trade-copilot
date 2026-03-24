import React from "react";

import type * as AuthModule from "~/components/auth";
import Register from "~/pages/register";
import { api } from "~/utils/api";

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

jest.mock("~/utils/api", () => {
  return {
    api: {
      register: {
        createUser: {
          useMutation: jest.fn(),
        },
      },
    },
  };
});

const setupMutationMock = (overrides: Partial<unknown> = {}) => {
  const defaultMutation = {
    mutate: jest.fn(),
    isLoading: false,
    isSuccess: false,
    data: undefined,
    error: undefined,
  };
  const mutation = { ...defaultMutation, ...overrides };
  (api.register.createUser.useMutation as jest.Mock).mockReturnValue(mutation);
  return mutation;
};

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders register form", () => {
    setupMutationMock();

    render(<Register />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    setupMutationMock();
    render(<Register />);
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Password must be atleast 6 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Confirm Password is required/i)
      ).toBeInTheDocument();
    });
  });

  it("calls mutation.mutate with form data on submit", async () => {
    const mockMut = setupMutationMock();
    render(<Register />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "Demo" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "demo@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "pass123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm/i), {
      target: { value: "pass123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockMut.mutate).toHaveBeenCalledWith({
        username: "Demo",
        email: "demo@example.com",
        password: "pass123",
      });
    });
  });
});
