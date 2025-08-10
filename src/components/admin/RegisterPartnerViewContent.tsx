import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, UserCheck, UserX, Loader2 } from "lucide-react";
import { registerPartnerService } from "@/services/registerPartner.service";
import type { RegisterPartnerResponse } from "@/apis/registerPartner.api";
import { toast } from "sonner";

interface RegisterPartnerViewContentProps {
  partnerId?: string;
  onBack?: () => void;
  onStatusUpdate?: () => void;
  showHeader?: boolean;
}

const RegisterPartnerViewContent: React.FC<RegisterPartnerViewContentProps> = ({
  partnerId,
  onBack,
  onStatusUpdate,
  showHeader = true,
}) => {
  const { id: idFromParams } = useParams();
  const [partner, setPartner] = useState<RegisterPartnerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualPartnerId = partnerId || idFromParams;

  useEffect(() => {
    const fetchPartner = async () => {
      if (!actualPartnerId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await registerPartnerService.getRegisterPartnerById(
          parseInt(actualPartnerId)
        );
        setPartner(response.data);
      } catch (err) {
        setError("Không tìm thấy thông tin đối tác hoặc đã bị xóa.");
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [actualPartnerId]);

  const handleApprove = async () => {
    if (!partner) return;

    setLoadingAction(true);
    try {
      const response = await registerPartnerService.approveRegisterPartner(
        partner.id
      );
      if (response.success) {
        toast.success("Phê duyệt đối tác thành công!");
        // Reload data
        const updatedResponse =
          await registerPartnerService.getRegisterPartnerById(partner.id);
        setPartner(updatedResponse.data);
        // Cập nhật list
        onStatusUpdate?.();
      }
    } catch (error) {
      console.error("Error approving partner:", error);
      toast.error("Có lỗi xảy ra khi phê duyệt đối tác");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!partner) return;

    const reason = prompt("Lý do từ chối:");
    if (!reason) return;

    setLoadingAction(true);
    try {
      const response = await registerPartnerService.rejectRegisterPartner(
        partner.id,
        reason
      );
      if (response.success) {
        toast.success("Từ chối đối tác thành công!");
        // Reload data
        const updatedResponse =
          await registerPartnerService.getRegisterPartnerById(partner.id);
        setPartner(updatedResponse.data);
        // Cập nhật list
        onStatusUpdate?.();
      }
    } catch (error) {
      console.error("Error rejecting partner:", error);
      toast.error("Có lỗi xảy ra khi từ chối đối tác");
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case "accept":
        return <Badge variant="default">Đã duyệt</Badge>;
      case "decline":
        return <Badge variant="destructive">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Đang tải...
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Vui lòng chờ trong khi chúng tôi tải thông tin đối tác.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="text-red-500">
        {error || "Không tìm thấy thông tin đối tác."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center mb-4">
          <Button
            onClick={onBack}
            className="flex items-center bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold ml-4">Chi Tiết Yêu Cầu Đối Tác</h1>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin công ty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Thông Tin Công Ty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tên công ty:
                    </label>
                    <p className="text-sm">{partner.company_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Người đăng ký:
                    </label>
                    <p className="text-sm">{partner.registrant_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email:
                    </label>
                    <p className="text-sm">{partner.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Số điện thoại:
                    </label>
                    <p className="text-sm">{partner.phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {partner.tax_code && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Mã số thuế:
                      </label>
                      <p className="text-sm">{partner.tax_code}</p>
                    </div>
                  )}
                  {partner.licence_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Số giấy phép:
                      </label>
                      <p className="text-sm">{partner.licence_number}</p>
                    </div>
                  )}
                  {partner.establish_year && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Năm thành lập:
                      </label>
                      <p className="text-sm">{partner.establish_year}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Địa chỉ */}
          <Card>
            <CardHeader>
              <CardTitle>Địa Chỉ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {partner.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Địa chỉ:
                      </label>
                      <p className="text-sm">{partner.address}</p>
                    </div>
                  )}
                  {partner.ward && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phường/Xã:
                      </label>
                      <p className="text-sm">{partner.ward}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {partner.district && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Quận/Huyện:
                      </label>
                      <p className="text-sm">{partner.district}</p>
                    </div>
                  )}
                  {partner.province && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Tỉnh/Thành phố:
                      </label>
                      <p className="text-sm">{partner.province}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mô tả */}
          {partner.desc && (
            <Card>
              <CardHeader>
                <CardTitle>Mô Tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{partner.desc}</p>
              </CardContent>
            </Card>
          )}

          {/* Logo/Avatar */}
          {partner.avatar && (
            <Card>
              <CardHeader>
                <CardTitle>Logo/Avatar</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={partner.avatar}
                  alt="Company logo"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar phải */}
        <div className="space-y-6">
          {/* Trạng thái và thao tác */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái & Thao Tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {getStatusBadge(partner.status)}
              </div>

              {partner.status === "pending" && (
                <div className="space-y-2">
                  <Button
                    onClick={handleApprove}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loadingAction}
                  >
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserCheck className="w-4 h-4 mr-2" />
                    )}
                    {loadingAction ? "Đang xử lý..." : "Phê duyệt"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={loadingAction}
                    className="w-full hover:bg-red-700"
                  >
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserX className="w-4 h-4 mr-2" />
                    )}
                    {loadingAction ? "Đang xử lý..." : "Từ chối"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thông tin khác */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Đăng Ký</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">ID yêu cầu</div>
                <div className="font-mono">{partner.id}</div>
              </div>
              {partner.created_at && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Ngày đăng ký
                  </div>
                  <div className="text-sm">
                    {new Date(partner.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              )}
              {partner.updated_at && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Cập nhật lần cuối
                  </div>
                  <div className="text-sm">
                    {new Date(partner.updated_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPartnerViewContent;
