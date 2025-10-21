/**
 * @jest-environment jsdom
 */
import Login from "~/pages/login";

import { render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("~/components/auth", () => ({
  handleSignIn: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("~/components/auth", () => ({
  ...jest.requireActual("~/components/auth"),
  AuthLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("Login Page", () => {
  test("renders login form", () => {
    render(<Login />);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
