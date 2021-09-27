// Used for rounding floating tnumber to two decimals. Useful for currency displays
export var round = (num: number): number => {
  return +(Math.round(parseFloat(num + "e+2"))  + "e-2");
}