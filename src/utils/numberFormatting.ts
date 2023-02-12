import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

const formatPercentage = (value: number, decimals: number = 4) => {
  return new BigNumber(value).decimalPlaces(decimals).toNumber() + ' %';
}

const formatDecimal = (value: number, decimals: number = 4) => {
  return new BigNumber(value).decimalPlaces(decimals).toFormat(decimals);
}

export {
  formatPercentage,
  formatDecimal,
}