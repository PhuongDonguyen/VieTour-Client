import { registerPartnerService } from "@/services/registerPartner.service";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RegisterPartnerListResponse,
  RegisterPartnerResponse,
} from "@/apis/registerPartner.api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Eye } from "lucide-react";
import RegisterPartnerViewContent from "./RegisterPartnerViewContent";

const RegisterPartner: React.FC = () => {
  const [partners, setPartners] = useState<RegisterPartnerListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "accept" | "decline" | "all"
  >("all");
  const [mode, setMode] = useState<"list" | "view">("list");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchPartners();
  }, [currentPage, statusFilter]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params: {
        status?: "pending" | "accept" | "decline";
        page?: number;
        limit?: number;
      } = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await registerPartnerService.getRegisterPartners(params);
      setPartners(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách đối tác");
    } finally {
      setLoading(false);
    }
  };

  // Handle view partner
  const handleViewPartner = (partner: RegisterPartnerListResponse) => {
    setSelectedPartnerId(partner.id.toString());
    setMode("view");
  };

  const handleBack = () => {
    setMode("list");
    setSelectedPartnerId(null);
    fetchPartners(); // reload lại list nếu cần
  };

  const handleStatusUpdate = () => {
    fetchPartners(); // Cập nhật list khi trạng thái thay đổi
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mode === "list" && (
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Quản lý yêu cầu đối tác</span>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("pending")}
                  >
                    Chờ duyệt
                  </Button>
                  <Button
                    variant={statusFilter === "accept" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("accept")}
                  >
                    Đã duyệt
                  </Button>
                  <Button
                    variant={statusFilter === "decline" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("decline")}
                  >
                    Đã từ chối
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên công ty</TableHead>
                    <TableHead>Người đăng ký</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>{partner.id}</TableCell>
                      <TableCell>{partner.company_name}</TableCell>
                      <TableCell>{partner.registrant_name}</TableCell>
                      <TableCell>{partner.email}</TableCell>
                      <TableCell>{partner.phone}</TableCell>
                      <TableCell>{getStatusBadge(partner.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPartner(partner)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="flex items-center px-3">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {mode === "view" && selectedPartnerId && (
        <RegisterPartnerViewContent
          partnerId={selectedPartnerId}
          onBack={handleBack}
          onStatusUpdate={handleStatusUpdate}
          showHeader={true}
        />
      )}
    </div>
  );
};

export default RegisterPartner;
