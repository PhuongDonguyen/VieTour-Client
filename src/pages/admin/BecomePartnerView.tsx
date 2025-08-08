import React, { useState, useEffect } from "react";
import { becomePartnerService } from "@/services/becomePartner.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { BecomePartnerResponse } from "@/apis/becomePartner.api";

const BecomePartnerView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<BecomePartnerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadPartnerDetail();
    }
  }, [id]);

  const loadPartnerDetail = async () => {
    try {
      setLoading(true);
      const response = await becomePartnerService.getBecomePartnerById(
        Number(id)
      );
      if (response.success) {
        setPartner(response.data);
      } else {
        toast.error("Có lỗi xảy ra khi tải thông tin chi tiết");
        navigate("/admin/become-partners");
      }
    } catch (error: any) {
      console.error("Error loading partner detail:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin chi tiết");
      navigate("/admin/become-partners");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    if (!partner) return;

    try {
      setUpdating(true);
      const response = await becomePartnerService.updateBecomePartnerStatus(
        partner.id,
        {
          status: newStatus,
        }
      );

      if (response.success) {
        toast.success(
          `Đã ${
            newStatus === "approved" ? "chấp nhận" : "từ chối"
          } yêu cầu thành công`
        );
        // Reload partner data
        await loadPartnerDetail();
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            Đã chấp nhận
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
            Đã từ chối
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/become-partners")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy thông tin yêu cầu</p>
          <Button
            onClick={() => navigate("/admin/become-partners")}
            className="mt-4"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/become-partners")}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết yêu cầu trở thành đối tác
            </h1>
            <p className="text-gray-600">ID: {partner.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(partner.status)}
          {partner.status === "pending" && (
            <div className="flex space-x-2">
              <Button
                onClick={() => handleStatusChange("approved")}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Chấp nhận
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange("rejected")}
                disabled={updating}
              >
                <X className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Thông tin cơ bản
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên công ty
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.company_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Người đăng ký
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.registrant_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Thông tin doanh nghiệp
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã số thuế
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.tax_code || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số giấy phép kinh doanh
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.licence_number || "Không có"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm thành lập
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.establish_year || "Không có"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Thông tin địa chỉ
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ chi tiết
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {partner.address || "Không có"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tỉnh/Thành phố
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {partner.province || "Không có"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {partner.district || "Không có"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phường/Xã
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {partner.ward || "Không có"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {partner.desc && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Mô tả về công ty
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {partner.desc}
                    </p>
                  </div>
                </div>
              )}

              {/* Avatar */}
              {partner.avatar && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                    Logo công ty
                  </h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={partner.avatar}
                      alt="Company logo"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Logo công ty</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomePartnerView;
