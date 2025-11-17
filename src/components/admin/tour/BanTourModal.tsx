import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import type { Tour } from "@/apis/tour.api";

interface BanTourModalProps {
  isOpen: boolean;
  tour: Tour | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  getCategoryName: (tour: Tour) => string;
}

const BanTourModal: React.FC<BanTourModalProps> = ({
  isOpen,
  tour,
  loading,
  onClose,
  onConfirm,
  getCategoryName,
}) => {
  if (!tour) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="w-5 h-5" />
            Xác nhận cấm tour
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn cấm tour này không? Tour sẽ không hiển thị
            trên hệ thống sau khi bị cấm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-4">
            <img
              src={tour.poster_url}
              alt={tour.title}
              className="w-24 h-16 object-cover rounded"
            />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">{tour.title}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Địa điểm:</span>{" "}
                  {tour.location || "Chưa cập nhật"}
                </p>
                <p>
                  <span className="font-medium">Danh mục:</span>{" "}
                  {getCategoryName(tour)}
                </p>
                <p>
                  <span className="font-medium">Giá:</span>{" "}
                  {tour.price.toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Đang xử lý...
              </span>
            ) : (
              "Xác nhận cấm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BanTourModal;

