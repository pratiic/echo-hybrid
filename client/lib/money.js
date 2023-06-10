export const convertToMoney = (num) => {
  if (!num.toString().includes(".")) {
    return num;
  }

  const fl = parseFloat(num);
  return parseFloat(fl.toFixed(2));
};
