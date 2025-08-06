import * as cancellationRequestApi from "../apis/cancellationRequest.api";

export const cancellationRequestService = {
  getMyCancellationRequests: (query?: string) =>
    cancellationRequestApi.getMyCancellationRequests(query),
  getCancellationRequestById: cancellationRequestApi.getCancellationRequestById,
  createCancellationRequest: cancellationRequestApi.createCancellationRequest,
  updateCancellationRequest: cancellationRequestApi.updateCancellationRequest,
  getAllCancellationRequests: (query?: string) =>
    cancellationRequestApi.getAllCancellationRequests(query),
  updateCancellationRequestStatus:
    cancellationRequestApi.updateCancellationRequestStatus,
  // Provider sử dụng chung API với admin, backend sẽ tự động filter theo role
  getProviderCancellationRequests: (query?: string) =>
    cancellationRequestApi.getAllCancellationRequests(query),
};
