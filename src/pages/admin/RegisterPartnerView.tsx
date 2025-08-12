import { registerPartnerService } from "@/services/registerPartner.service";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegisterPartnerResponse } from "@/apis/registerPartner.api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RegisterPartnerView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<RegisterPartnerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPartner();
    }
  }, [id]);

  const fetchPartner = async () => {
    try {
      setLoading(true);
      const response = await registerPartnerService.getRegisterPartnerById(
        parseInt(id!)
      );
      setPartner(response.data);
    } catch (error) {
      console.error("Error fetching partner:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin đối tác");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!partner) return;

    setLoadingAction(true);
    try {
      const response = await registerPartnerService.approveRegisterPartner(
        partner.id
      );
      if (response.success) {
        toast.success("Phê duyệt đối tác thành công!");
        fetchPartner(); // Reload data
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
        fetchPartner(); // Reload data
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              Không tìm thấy thông tin đối tác
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Chi tiết yêu cầu đối tác</span>
            <div className="flex gap-2">
              {partner.status === "pending" && (
                <>
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={loadingAction}
                  >
                    {loadingAction && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Phê duyệt
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={loadingAction}
                  >
                    {loadingAction && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Từ chối
                  </Button>
                </>
              )}
              {getStatusBadge(partner.status)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin công ty</h3>
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

            <div>
              <h3 className="text-lg font-semibold mb-4">Địa chỉ</h3>
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
          </div>

          {partner.desc && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Mô tả</h3>
              <p className="text-sm text-gray-700">{partner.desc}</p>
            </div>
          )}

          {partner.avatar && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Logo/Avatar</h3>
              <img
                src={partner.avatar}
                alt="Company logo"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPartnerView;
