export const api = {
  tags: {
    getTagsByFilter: {
      useQuery: jest.fn(() => ({ data: null, isLoading: false })),
    },
  },
  trades: {
    addTrades: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
        isLoading: false,
      })),
    },
    getTrades: {
      useInfiniteQuery: jest.fn(),
    },
  },
  useContext: jest.fn(() => ({
    trades: { invalidate: jest.fn() },
  })),
};
