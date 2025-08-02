import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { cancellationRequestService } from "../../services/cancellationRequest.service";
import { getAllTours } from "../../apis/tour.api";
import { useAuth } from "../../hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search } from "lucide-react";

interface CancellationRequest {
  id: number;
  booking_id: number;
  request_date: string;
  refund_amount: number;
  status: string;
  transaction_image?: string | null;
  booking?: {
    client_name: string;
    client_phone: string;
    schedule?: {
      tour?: {
        title: string;
        provider?: {
          company_name: string;
        };
      };
    };
  };
}

const AdminCancellationRequestsTable: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CancellationRequest | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [providerId, setProviderId] = useState("");
  const [tourId, setTourId] = useState("");
  const [status, setStatus] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch providers and tours for admin, tours for provider
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === "admin") {
          // For admin, fetch all tours
          const toursRes = await getAllTours({ limit: 1000 });
          console.log("Admin tours response:", toursRes);
          setTours(toursRes.data || []);
          setProviders([]); // No providers needed for admin
        } else if (user?.role === "provider") {
          // For provider, fetch their own tours
          const toursRes = await getAllTours({ limit: 1000 });
          console.log("Provider tours response:", toursRes);
          setTours(toursRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching providers/tours:", error);
        setTours([]); // Set empty array on error
      }
    };
    fetchData();
  }, [user?.role]);

  // Debug tours state
  useEffect(() => {
    console.log("Current tours state:", tours);
    console.log("Tours is array:", Array.isArray(tours));
    console.log("Tours length:", tours?.length);
  }, [tours]);

  // Filter tours based on selected provider (admin only)
  useEffect(() => {
    if (user?.role === "admin" && providerId) {
      const filteredTours = tours.filter(
        (tour) => tour.provider?.id === parseInt(providerId)
      );
      setTours(filteredTours);
    }
  }, [providerId, user?.role]);

  // Fetch cancellation requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        let query = "?";
        const params = new URLSearchParams();

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (status) params.append("status", status);
        if (tourId) params.append("tour_id", tourId);

        const queryString = params.toString();
        const finalQuery = queryString ? `?${queryString}` : "";

        // Sử dụng chung API, backend sẽ tự động filter theo role
        const response =
          await cancellationRequestService.getAllCancellationRequests(
            finalQuery
          );

        setRequests(response.data || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Không thể tải danh sách yêu cầu hoàn tiền");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [debouncedSearch, status, tourId, user?.role]);

  const handleUpload = async () => {
    if (!selected || !file) return;

    setUploading(true);
    try {
      await cancellationRequestService.updateCancellationRequestStatus(
        selected.id,
        {
          status: "success",
          transaction_image: file,
        }
      );

      toast.success("Cập nhật thành công!");
      setSelected(null);
      setFile(null);
      setPreview(null);

      // Refresh data - sử dụng chung API
      const response =
        await cancellationRequestService.getAllCancellationRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Có lỗi xảy ra khi cập nhật");
    } finally {
      setUploading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === "admin"
              ? "Quản lý yêu cầu hoàn tiền"
              : "Yêu cầu hoàn tiền của tôi"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "admin"
              ? "Quản lý các yêu cầu hoàn tiền từ khách hàng"
              : "Theo dõi các yêu cầu hoàn tiền từ khách hàng của bạn"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm & Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên tour..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>

            {user?.role === "admin" && (
              <div className="w-56">
                <Select
                  value={providerId || "all"}
                  onValueChange={(v) => setProviderId(v === "all" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-56">
              <Select
                value={tourId || "all"}
                onValueChange={(v) => setTourId(v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tour</SelectItem>
                  {Array.isArray(tours) &&
                    tours.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Select
                value={status || "all"}
                onValueChange={(v) => setStatus(v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="success">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu hoàn tiền</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách yêu cầu...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên khách</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Ngày yêu cầu</TableHead>
                  <TableHead>Số tiền hoàn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ảnh giao dịch</TableHead>
                  {user?.role === "admin" && <TableHead>Hành động</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={user?.role === "admin" ? 8 : 7}
                      className="text-center py-8 text-gray-500"
                    >
                      Không có kết quả phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.id}</TableCell>
                      <TableCell>{req.booking?.client_name || "-"}</TableCell>
                      <TableCell>{req.booking?.client_phone || "-"}</TableCell>
                      <TableCell>
                        {new Date(req.request_date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {req.refund_amount.toLocaleString()} đ
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(req.status)}>
                          {req.status === "pending"
                            ? "Chờ xử lý"
                            : req.status === "success"
                            ? "Đã hoàn tiền"
                            : req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.transaction_image ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Xem ảnh
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogTitle>Ảnh giao dịch</DialogTitle>
                              <img
                                src={req.transaction_image}
                                alt="Ảnh giao dịch"
                                className="max-h-96 mx-auto"
                              />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-gray-400">Chưa có</span>
                        )}
                      </TableCell>
                      {user?.role === "admin" && (
                        <TableCell>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelected(req)}
                          >
                            {req.transaction_image
                              ? req.status === "pending"
                                ? "Cập nhật ảnh & xác nhận hoàn tiền"
                                : "Cập nhật ảnh giao dịch"
                              : "Upload ảnh giao dịch"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal upload ảnh giao dịch */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setFile(null);
            setPreview(null);
          }
        }}
      >
        <DialogContent>
          <DialogTitle>
            {selected?.transaction_image && selected?.status === "success"
              ? "Cập nhật lại ảnh giao dịch"
              : "Upload ảnh giao dịch & xác nhận hoàn tiền"}
          </DialogTitle>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
            {preview && (
              <img src={preview} alt="Preview" className="max-h-60 mx-auto" />
            )}
            <Button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full"
            >
              {uploading ? "Đang upload..." : "Lưu ảnh & xác nhận"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCancellationRequestsTable;
