import Link from "next/link";

import CaretLeft from "~/components/icons/CaretLeft";
import { useAppStore } from "~/hooks/useAppStore";
import { type ChartMarkerActions } from "~/hooks/useChartMarkers";

interface Props {
  lastTrade: string | null | undefined;
  nextTrade: string | null | undefined;
  dispatch: React.Dispatch<ChartMarkerActions>;
}
export const TradeNavigationButtons = ({
  lastTrade,
  nextTrade,
  dispatch,
}: Props) => {
  const updateTagType = useAppStore((state) => state.updateTagType);

  const handleTradeNavigation = () => {
    updateTagType("details");
    setTimeout(() => {
      dispatch({
        type: "RESET_STATE",
      });
    }, 500);
  };

  return (
    <div className="join">
      <button
        className="btn btn-info btn-outline  join-item tooltip btn-sm"
        data-tip="Prev"
        disabled={!lastTrade}
        onClick={() => handleTradeNavigation()}
      >
        <Link href={`${lastTrade}`}>
          <CaretLeft />
        </Link>
      </button>
      <button
        className="btn btn-info btn-outline join-item tooltip btn-sm"
        data-tip="Next"
        disabled={!nextTrade}
        onClick={() => handleTradeNavigation()}
      >
        <Link href={`${nextTrade}`}>
          <div className="rotate-180">
            <CaretLeft />
          </div>
        </Link>
      </button>
    </div>
  );
};
