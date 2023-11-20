type SymbolMapping = Record<string, string>;

export const getSymbol = (symbol: string) => {
  const symbolMapping: SymbolMapping = {
    us100: "QQQ",
    us500: "SPY",
    us30: "DIA",
  };

  let filteredSymbol = symbol.split(".")[0]?.toUpperCase();
  if (filteredSymbol && filteredSymbol in symbolMapping) {
    filteredSymbol = symbolMapping[filteredSymbol];
  }

  return { validSymbol: filteredSymbol };
};
