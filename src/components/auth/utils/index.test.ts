import { loginValidationSchema, registerValidationSchema } from "./index";

describe("Validation Schemas", () => {
  test("registerValidationSchema passes valid data", () => {
    const data = {
      username: "TopStepTrader",
      email: "Trader@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    expect(() => registerValidationSchema.parse(data)).not.toThrow();
  });

  test("registerValidationSchema fails invalid username", () => {
    const data = {
      username: "TopStepTrader123",
      email: "Trader@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    expect(() => registerValidationSchema.parse(data)).toThrow(
      /Name cannot have any numbers or special characters/
    );
  });

  test("loginValidationSchema fails invalid email", () => {
    const data = {
      email: "invalid-email",
      password: "password123",
    };

    expect(() => loginValidationSchema.parse(data)).toThrow(
      /Must be a valid email/
    );
  });
});
