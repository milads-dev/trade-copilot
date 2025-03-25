type SymbolMapping = Record<string, string>;

export const getSymbol = (symbol: string) => {
  const symbolMapping: SymbolMapping = {};

  const nasSymbols = ["US100", "NAS100", "MNQ", "NQ"];
  const spySymbols = ["US500", "MES"];
  const dowSymbols = ["US30"];

  nasSymbols.forEach((key) => (symbolMapping[key] = "QQQ"));
  spySymbols.forEach((key) => (symbolMapping[key] = "SPX"));
  dowSymbols.forEach((key) => (symbolMapping[key] = "DIA"));

  let filteredSymbol = symbol.split(".")[0]?.toUpperCase();

  if (
    filteredSymbol &&
    (filteredSymbol.includes("MNQ") || filteredSymbol.includes("NQ"))
  ) {
    filteredSymbol = "QQQ";
  } else if (filteredSymbol && filteredSymbol.includes("MES")) {
    filteredSymbol = "SPX";
  } else if (filteredSymbol && filteredSymbol in symbolMapping) {
    filteredSymbol = symbolMapping[filteredSymbol];
  }

  return { validSymbol: filteredSymbol };
};
