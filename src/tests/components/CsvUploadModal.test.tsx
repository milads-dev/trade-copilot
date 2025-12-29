/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CsvUploadModal } from "~/components/modals";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("~/utils/api", () => ({
  api: {
    trades: {
      getTrades: {
        useInfiniteQuery: jest.fn(),
      },
      addTrades: {
        useMutation: jest.fn(() => ({ isLoading: false, mutate: jest.fn() })),
      },
    },
    tags: {
      getTagsByFilter: {
        useQuery: jest.fn(),
      },
    },
    useContext: jest.fn(() => ({ trades: { invalidate: jest.fn() } })),
  },
}));

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: {},
    replace: jest.fn(),
  }),
}));

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const selectPlatform = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByAltText("TopStepX"));
};
const goToNextStep = async (user: ReturnType<typeof userEvent.setup>) => {
  const nextButton = await screen.findByText(/next step/i);
  await user.click(nextButton);
};

const createCsvFile = () =>
  new File(
    [
      `
Id,ContractName,EnteredAt,ExitedAt,EntryPrice,ExitPrice,Fees,PnL,Size,Type,TradeDay,TradeDuration,Commissions
1838713343,DMO,12/26/2025 09:33:24 -05:00,12/26/2025 09:33:59 -05:00,25876.25,25909.75,2.22,-201,3,Short,12/26/2025 00:00:00 -06:00,00:00:35.0011640,
1838713344,DMO,12/26/2025 10:01:10 -05:00,12/26/2025 10:02:00 -05:00,25910.00,25890.25,2.22,120,2,Long,12/26/2025 00:00:00 -06:00,00:00:49.1234560,
`.trim(),
    ],
    "test.csv",
    { type: "text/csv" }
  );

describe("Csv Modal", () => {
  it("imports trades successfully through the CSV upload flow", async () => {
    const user = userEvent.setup();

    render(<CsvUploadModal />);

    // Step 1: Platform selection
    const nextButton = await screen.findByText(/next step/i);
    expect(nextButton).toBeDisabled();

    await selectPlatform(user);

    expect(nextButton).toBeEnabled();
    await user.click(nextButton);

    // Step 2: Upload CSV
    await screen.findByText(/preview trades/i);

    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;

    await user.upload(input, createCsvFile());

    expect((await screen.findAllByText("DMO")).length).toBeGreaterThan(0);

    // Step 3: Confirm import
    const saveButton = await screen.findByText(/next step/i);
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(
      await screen.findByText(/view imported trades/i)
    ).toBeInTheDocument();
  });

  it("does not allow advancing without selecting a platform", async () => {
    render(<CsvUploadModal />);

    const nextButton = await screen.findByText(/next step/i);
    expect(nextButton).toBeDisabled();
  });
  it("shows an error when CSV format is invalid", async () => {
    const user = userEvent.setup();
    render(<CsvUploadModal />);

    await selectPlatform(user);
    await goToNextStep(user);

    await screen.findByText(/preview trades/i);

    const input = document.querySelector<HTMLElement>('input[type="file"]')!;
    await user.upload(
      input,
      new File(["bad,data\nwrong,format"], "bad.csv", { type: "text/csv" })
    );

    expect(window.alert).toHaveBeenCalledWith("Wrong Trade Format");
  });
});
