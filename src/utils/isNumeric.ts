export const isNumeric = (val: any) =>
  val !== null &&
  val !== undefined &&
  val.toString().trim().length > 0 &&
  !isNaN(parseFloat(val)) &&
  isFinite(val);
