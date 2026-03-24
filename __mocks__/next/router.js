export const useRouter = jest.fn(() => ({
  query: {},
  replace: jest.fn(),
  push: jest.fn(),
  pathname: "/",
}));
