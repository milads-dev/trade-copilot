type SymbolMapping = Record<string, string>;

export const getSymbol = (symbol: string) => {
  const symbolMapping: SymbolMapping = {
    US100: "QQQ",
    US500: "SPY",
    US30: "DIA",
    NAS100: "QQQ",
  };

  let filteredSymbol = symbol.split(".")[0]?.toUpperCase();
  if (filteredSymbol && filteredSymbol in symbolMapping) {
    filteredSymbol = symbolMapping[filteredSymbol];
  }

  return { validSymbol: filteredSymbol };
};
