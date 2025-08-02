import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "@/context/authContext";
import { ArrowLeft, Save, DollarSign, Calendar, Clock } from "lucide-react";
import {
  fetchTourPriceOverrideById,
  createTourPriceOverrideService,
  updateTourPriceOverrideService,
} from "../../../services/tourPriceOverride.service";
import { providerTourPriceService } from "../../../services/provider/providerTourPrice.service";
import type { TourPriceOverride } from "../../../apis/tourPriceOverride.api";

interface TourPriceOverrideEditorProps {
  mode: "create" | "edit";
  id?: string;
  onBack?: () => void;
}

const TourPriceOverrideEditor: React.FC<TourPriceOverrideEditorProps> = ({
  mode,
  id,
  onBack,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Lấy tour_id từ URL
  const tourIdFromUrl = searchParams.get("tour_id");

  const [loading, setLoading] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
  const [availableTourPrices, setAvailableTourPrices] = useState<
    {
      id: number;
      tour_title: string;
      adult_price: number;
      kid_price: number;
      note?: string;
    }[]
  >([]);

  const [form, setForm] = useState({
    tour_price_id: "",
    override_type: "",
    override_date: "",
    start_date: "",
    end_date: "",
    day_of_week: "",
    adult_price: "",
    kid_price: "",
    note: "",
    is_active: true,
  });

  // Load available tour prices
  const loadAvailableTourPrices = async () => {
    try {
      setLoadingTours(true);

      // Nếu có tour_id từ URL, chỉ lấy tour prices của tour đó
      if (tourIdFromUrl) {
        const response = await providerTourPriceService.getTourPrices({
          page: 1,
          limit: 100,
          tour_id: parseInt(tourIdFromUrl),
        });

        let pricesData: any[] = [];
        if (response && typeof response === "object") {
          if (response.data && Array.isArray(response.data)) {
            pricesData = response.data;
          } else if (Array.isArray(response)) {
            pricesData = response;
          } else if (
            "success" in response &&
            "data" in response &&
            Array.isArray(response.data)
          ) {
            pricesData = response.data;
          }
        }

        // Transform data to include tour title and note
        const transformedPrices = pricesData.map((price) => ({
          id: price.id,
          tour_title: price.tour?.title || `Tour ID: ${price.tour_id}`,
          adult_price: price.adult_price,
          kid_price: price.kid_price,
          note: price.note || "",
        }));

        setAvailableTourPrices(transformedPrices);
      } else {
        // Nếu không có tour_id, hiển thị thông báo
        setAvailableTourPrices([]);
      }
    } catch (error) {
      console.error("Failed to load tour prices:", error);
      setAvailableTourPrices([]);
    } finally {
      setLoadingTours(false);
    }
  };

  // Load existing data for edit mode
  useEffect(() => {
    const loadExistingData = async () => {
      if (mode === "edit" && id) {
        try {
          setLoading(true);
          const response = await fetchTourPriceOverrideById(parseInt(id));

          setForm({
            tour_price_id: response.tour_price_id.toString(),
            override_type: response.override_type,
            override_date: response.override_date || "",
            start_date: response.start_date || "",
            end_date: response.end_date || "",
            day_of_week: response.day_of_week || "",
            adult_price: response.adult_price.toString(),
            kid_price: response.kid_price.toString(),
            note: response.note || "",
            is_active: response.is_active,
          });
        } catch (error) {
          console.error("Failed to load price override:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadExistingData();
    loadAvailableTourPrices();
  }, [mode, id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (
      !form.tour_price_id ||
      !form.override_type ||
      !form.adult_price ||
      !form.kid_price ||
      !form.note
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    // Validate based on override type
    if (form.override_type === "single_date" && !form.override_date) {
      alert("Vui lòng chọn ngày áp dụng.");
      return;
    }
    if (form.override_type === "weekly" && !form.day_of_week) {
      alert("Vui lòng chọn ngày trong tuần.");
      return;
    }
    if (
      form.override_type === "date_range" &&
      (!form.start_date || !form.end_date)
    ) {
      alert("Vui lòng chọn khoảng thời gian áp dụng.");
      return;
    }

    try {
      setLoading(true);

      const formData = {
        tour_price_id: parseInt(form.tour_price_id),
        override_type: form.override_type,
        override_date: form.override_date || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        day_of_week: form.day_of_week || null,
        adult_price: parseInt(form.adult_price),
        kid_price: parseInt(form.kid_price),
        note: form.note,
        is_active: form.is_active,
      };

      if (mode === "edit" && id) {
        await updateTourPriceOverrideService(parseInt(id), formData);
      } else {
        await createTourPriceOverrideService(formData);
      }

      if (onBack) {
        onBack();
      } else {
        navigate(`/admin/tours/price-overrides?tour_id=${tourIdFromUrl}`);
      }
    } catch (error) {
      console.error("Failed to save price override:", error);
      alert("Không thể lưu giá đặc biệt. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={
              onBack
                ? onBack
                : () =>
                    navigate(
                      `/admin/tours/price-overrides?tour_id=${tourIdFromUrl}`
                    )
            }
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "edit" ? "Chỉnh Sửa" : "Tạo Mới"} Giá Đặc Biệt
            </h1>
            <p className="text-muted-foreground">
              {mode === "edit"
                ? "Cập nhật thông tin giá đặc biệt"
                : "Thêm giá đặc biệt mới cho tour"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading
            ? "Đang lưu..."
            : mode === "edit"
            ? "Lưu thay đổi"
            : "Tạo mới"}
        </Button>
      </div>

      {loading && mode === "edit" ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Đang tải dữ liệu...
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Vui lòng chờ trong khi chúng tôi tải thông tin giá đặc biệt.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Thông Tin Cơ Bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tour_price_id" className="mb-2 block">
                    Tour Price *
                  </Label>
                  {!tourIdFromUrl ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        Không tìm thấy tour_id trong URL. Vui lòng quay lại
                        trang danh sách tour.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Select
                        value={form.tour_price_id}
                        onValueChange={(value) =>
                          handleInputChange("tour_price_id", value)
                        }
                        disabled={loadingTours || mode === "edit"}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingTours
                                ? "Đang tải..."
                                : "Chọn tour price..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTourPrices.length > 0 ? (
                            availableTourPrices.map((price) => (
                              <SelectItem
                                key={price.id}
                                value={price.id.toString()}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {price.tour_title}
                                  </span>
                                  {price.note && (
                                    <span className="text-xs text-muted-foreground">
                                      {price.note}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              Không có tour price nào cho tour này
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {mode === "edit" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Không được phép chỉnh sửa
                        </p>
                      )}
                    </>
                  )}

                  {/* Hiển thị thông tin giá gốc khi đã chọn */}
                  {form.tour_price_id && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <span>📋</span>
                        Thông Tin Giá Gốc (Tham Khảo)
                      </h4>
                      {(() => {
                        const selectedPrice = availableTourPrices.find(
                          (p) => p.id.toString() === form.tour_price_id
                        );
                        return selectedPrice ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-700 font-medium">
                                Giá người lớn:
                              </span>
                              <span className="font-semibold text-blue-900 text-lg">
                                {formatCurrency(selectedPrice.adult_price)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-blue-700 font-medium">
                                Giá trẻ em:
                              </span>
                              <span className="font-semibold text-blue-900 text-lg">
                                {formatCurrency(selectedPrice.kid_price)}
                              </span>
                            </div>
                            {selectedPrice.note && (
                              <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-700 font-medium text-sm">
                                    Ghi chú:
                                  </span>
                                  <span className="text-blue-800 text-sm flex-1">
                                    {selectedPrice.note}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mr-2"></div>
                            <span className="text-blue-700 text-sm">
                              Đang tải thông tin giá gốc...
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="override_type" className="mb-2 block">
                    Loại giá đặc biệt *
                  </Label>
                  <Select
                    value={form.override_type}
                    onValueChange={(value) =>
                      handleInputChange("override_type", value)
                    }
                    disabled={mode === "edit"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_date">Ngày cụ thể</SelectItem>
                      <SelectItem value="weekly">
                        Theo thứ trong tuần
                      </SelectItem>
                      <SelectItem value="date_range">
                        Khoảng thời gian
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {mode === "edit" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Không được phép chỉnh sửa
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adult_price" className="mb-2 block">
                      Giá người lớn (VND) *
                    </Label>
                    <Input
                      type="number"
                      value={form.adult_price}
                      onChange={(e) =>
                        handleInputChange("adult_price", e.target.value)
                      }
                      placeholder="Nhập giá người lớn"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kid_price" className="mb-2 block">
                      Giá trẻ em (VND) *
                    </Label>
                    <Input
                      type="number"
                      value={form.kid_price}
                      onChange={(e) =>
                        handleInputChange("kid_price", e.target.value)
                      }
                      placeholder="Nhập giá trẻ em"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="note" className="mb-2 block">
                    Ghi chú *
                  </Label>
                  <Textarea
                    value={form.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    placeholder="Nhập ghi chú (bắt buộc)"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) =>
                      handleInputChange("is_active", e.target.checked)
                    }
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Kích hoạt</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Date/Time Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Cài Đặt Thời Gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.override_type === "single_date" && (
                  <div>
                    <Label htmlFor="override_date" className="mb-2 block">
                      Ngày áp dụng *
                    </Label>
                    <Input
                      type="date"
                      value={form.override_date}
                      onChange={(e) =>
                        handleInputChange("override_date", e.target.value)
                      }
                      required
                    />
                  </div>
                )}

                {form.override_type === "weekly" && (
                  <div>
                    <Label htmlFor="day_of_week" className="mb-2 block">
                      Ngày trong tuần *
                    </Label>
                    <Select
                      value={form.day_of_week}
                      onValueChange={(value) =>
                        handleInputChange("day_of_week", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngày..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Thứ 2</SelectItem>
                        <SelectItem value="tuesday">Thứ 3</SelectItem>
                        <SelectItem value="wednesday">Thứ 4</SelectItem>
                        <SelectItem value="thursday">Thứ 5</SelectItem>
                        <SelectItem value="friday">Thứ 6</SelectItem>
                        <SelectItem value="saturday">Thứ 7</SelectItem>
                        <SelectItem value="sunday">Chủ nhật</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {form.override_type === "date_range" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="start_date" className="mb-2 block">
                        Ngày bắt đầu *
                      </Label>
                      <Input
                        type="date"
                        value={form.start_date}
                        onChange={(e) =>
                          handleInputChange("start_date", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date" className="mb-2 block">
                        Ngày kết thúc *
                      </Label>
                      <Input
                        type="date"
                        value={form.end_date}
                        onChange={(e) =>
                          handleInputChange("end_date", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                {!form.override_type && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Vui lòng chọn loại giá đặc biệt để cài đặt thời gian</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            {form.tour_price_id && form.override_type && (
              <Card>
                <CardHeader>
                  <CardTitle>Xem Trước</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Giá người lớn:
                    </span>
                    <span className="font-semibold text-green-600">
                      {form.adult_price
                        ? formatCurrency(parseInt(form.adult_price))
                        : "Chưa nhập"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Giá trẻ em:
                    </span>
                    <span className="font-semibold text-blue-600">
                      {form.kid_price
                        ? formatCurrency(parseInt(form.kid_price))
                        : "Chưa nhập"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Trạng thái:
                    </span>
                    <span
                      className={`font-semibold ${
                        form.is_active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {form.is_active ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourPriceOverrideEditor;
