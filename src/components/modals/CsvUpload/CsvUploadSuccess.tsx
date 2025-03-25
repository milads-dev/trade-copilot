import Image from "next/image";
import { useRouter } from "next/router";

import { generateDateRangeUrl } from "~/features/tradeHistory";

import { type TradeDetails } from "../types";
import AnimatedDiv from "./AnimatedDiv";

interface Props {
  direction: number;
  tradeData: TradeDetails[];
  handleModalClose: () => void;
}
const CsvUploadSuccess = ({
  direction,
  tradeData,
  handleModalClose,
}: Props) => {
  const router = useRouter();

  const handleViewNewTrades = () => {
    const currentUrl = router.pathname;

    const firstItem = tradeData?.shift();
    const firstTimestamp: Date | null = firstItem?.TimeStamp
      ? new Date(firstItem.TimeStamp)
      : null;
    const lastItem = tradeData?.pop();
    const lastTimestamp: Date | null = lastItem?.TimeStamp
      ? new Date(lastItem.TimeStamp)
      : null;

    const newUrl = generateDateRangeUrl(
      currentUrl,
      firstTimestamp,
      lastTimestamp
    );

    void router.replace(newUrl, undefined, { shallow: true });

    const modal = document.getElementById(
      "csv_upload_modal"
    ) as HTMLDialogElement | null;
    if (modal) {
      handleModalClose();
      modal.close();
    }
  };
  return (
    <AnimatedDiv direction={direction}>
      <div className="mt-5 flex h-full w-full flex-col space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/assets/trade-import-success.jpeg"
            alt="Trade Import Success"
            width={550}
            height={550}
            className="mask mask-squircle"
          />
        </div>
        <button
          className="btn btn-info btn-outline  w-full"
          onClick={() => handleViewNewTrades()}
        >
          View Imported Trades
        </button>
      </div>
    </AnimatedDiv>
  );
};

export default CsvUploadSuccess;
