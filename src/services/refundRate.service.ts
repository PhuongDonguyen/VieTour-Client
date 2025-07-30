import * as refundRateApi from "../apis/refundRate.api";

export const refundRateService = {
  getRefundRates: refundRateApi.getRefundRates,
  getActiveRefundRates: refundRateApi.getActiveRefundRates,
  getRefundRateById: refundRateApi.getRefundRateById,
  calculateRefundRate: async (days: number, rates?: any[]) => {
    if (rates && rates.length > 0) {
      return rates.find((rate) => days >= rate.from_day && days <= rate.to_day);
    }
    const res = await refundRateApi.calculateRefundRate(days);
    return res.data.data;
  },
};
