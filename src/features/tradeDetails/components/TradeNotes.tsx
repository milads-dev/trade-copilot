import React, { useState } from "react";

import { useRouter } from "next/router";

import { NoteEditor } from "~/components/NoteEditor";
import { api } from "~/utils/api";

import { TradeNoteSkeleton } from "./TradeNoteSkeleton";

export const TradeNotes = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const symbol = router.query.symbol as string;
  const date = router.query.date as string;

  const [disabled, setDisabled] = useState(true);
  const [editorLoading, setEditorLoading] = useState(true);

  const { data } = api.tradeDetails.getTradeNotes.useQuery(
    { symbol, date },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { notes } = data ?? {};

  const addTradeNotes = api.tradeDetails.addTradeNotes.useMutation({
    onSuccess() {
      void ctx.tradeDetails.invalidate();
    },
  });
  const handleEditorUpdate = (note: string, type: string) => {
    if (type === "change") setDisabled(false);
    if (type === "init") setEditorLoading(false);
    if (type === "submit") {
      addTradeNotes.mutate({
        symbol,
        date,
        note,
      });
      setDisabled(true);
    }
  };
  return (
    <div className="relative h-[36rem] w-[44rem]">
      {editorLoading && <TradeNoteSkeleton />}
      <div className="z-10">
        <form>
          <NoteEditor notes={notes} handleEditorUpdate={handleEditorUpdate} />
          <button
            className="btn btn-info btn-outline my-5 w-full"
            disabled={disabled && !addTradeNotes.isLoading}
            type="submit"
            name="submitbtn"
          >
            {addTradeNotes.isLoading ? (
              <span className="loading loading-dots" />
            ) : (
              "Save"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
