import * as cancellationRequestApi from "../apis/cancellationRequest.api";

export const cancellationRequestService = {
  getMyCancellationRequests: cancellationRequestApi.getMyCancellationRequests,
  getCancellationRequestById: cancellationRequestApi.getCancellationRequestById,
  createCancellationRequest: cancellationRequestApi.createCancellationRequest,
  updateCancellationRequest: cancellationRequestApi.updateCancellationRequest,
};
