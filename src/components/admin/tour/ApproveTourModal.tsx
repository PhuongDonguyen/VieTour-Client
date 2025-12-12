import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import type { Tour } from "@/apis/tour.api";

interface ApproveTourModalProps {
  isOpen: boolean;
  tour: Tour | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  getCategoryName: (tour: Tour) => string;
}

const ApproveTourModal: React.FC<ApproveTourModalProps> = ({
  isOpen,
  tour,
  loading,
  onClose,
  onConfirm,
  getCategoryName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Xác nhận duyệt tour
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn duyệt tour này không?
          </DialogDescription>
        </DialogHeader>
        {tour && (
          <div className="py-4">
            <div className="flex items-start gap-4">
              <img
                src={tour.poster_url}
                alt={tour.title}
                className="w-20 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {tour.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Địa điểm: {tour.starting_point || "Chưa cập nhật"}
                </p>
                <p className="text-sm text-gray-600">
                  Danh mục: {getCategoryName(tour)}
                </p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Đang xử lý...
              </span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Xác nhận duyệt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveTourModal;

