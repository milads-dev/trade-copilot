import Link from "next/link";

import CaretLeft from "~/components/icons/CaretLeft";
import { useAppStore } from "~/hooks/useAppStore";

interface Props {
  lastTrade: string | null | undefined;
  nextTrade: string | null | undefined;
}
export const TradeNavigationButtons = ({ lastTrade, nextTrade }: Props) => {
  const updateTagType = useAppStore((state) => state.updateTagType);

  return (
    <div className="join">
      <button
        className="btn btn-info btn-outline  join-item tooltip btn-sm"
        data-tip="Prev"
        disabled={!lastTrade}
        onClick={() => updateTagType("details")}
      >
        <Link href={`${lastTrade}`}>
          <CaretLeft />
        </Link>
      </button>
      <button
        className="btn btn-info btn-outline join-item tooltip btn-sm"
        data-tip="Next"
        disabled={!nextTrade}
        onClick={() => updateTagType("details")}
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
