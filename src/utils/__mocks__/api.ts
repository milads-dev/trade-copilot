export const api = {
  tags: {
    getTagsByFilter: {
      useQuery: jest.fn(() => ({ data: null, isLoading: false })),
    },
    removeTag: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
      })),
    },
    addTagToTrade: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
      })),
    },
    addTag: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
      })),
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
