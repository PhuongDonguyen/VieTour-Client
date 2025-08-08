import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { becomePartnerService } from "../services/becomePartner.service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
  province_code: string;
}

interface Ward {
  code: string;
  name: string;
  district_code: string;
}

const TOTAL_STEPS = 3;

export const BecomePartnerForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    company_name: "",
    registrant_name: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    tax_code: "",
    licence_number: "",
    establish_year: new Date().getFullYear(),
    desc: "",
  });

  // Address data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (formData.province) {
      loadDistricts(formData.province);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.province]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.district) {
      loadWards(formData.district);
    } else {
      setWards([]);
    }
  }, [formData.district]);

  const loadProvinces = async () => {
    try {
      setLoadingAddress(true);
      const response = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Error loading provinces:", error);
      toast.error("Không thể tải danh sách tỉnh/thành phố");
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadDistricts = async (provinceCode: string) => {
    try {
      setLoadingAddress(true);
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts || []);
      setFormData((prev) => ({ ...prev, district: "", ward: "" }));
    } catch (error) {
      console.error("Error loading districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadWards = async (districtCode: string) => {
    try {
      setLoadingAddress(true);
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      setWards(data.wards || []);
      setFormData((prev) => ({ ...prev, ward: "" }));
    } catch (error) {
      console.error("Error loading wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.company_name.trim()) {
        newErrors.company_name = "Tên công ty là bắt buộc";
      }
      if (!formData.registrant_name.trim()) {
        newErrors.registrant_name = "Tên người đăng ký là bắt buộc";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email là bắt buộc";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Số điện thoại là bắt buộc";
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Số điện thoại không hợp lệ";
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        newErrors.address = "Địa chỉ là bắt buộc";
      }
      if (!formData.province) {
        newErrors.province = "Tỉnh/thành phố là bắt buộc";
      }
      if (!formData.district) {
        newErrors.district = "Quận/huyện là bắt buộc";
      }
      if (!formData.ward) {
        newErrors.ward = "Phường/xã là bắt buộc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert codes to names before sending
      const submitData = {
        ...formData,
        province: getProvinceName(formData.province),
        district: getDistrictName(formData.district),
        ward: getWardName(formData.ward),
      };

      const response = await becomePartnerService.createBecomePartner(
        submitData
      );
      if (response.success) {
        setShowSuccess(true);
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProvinceName = (code: string) => {
    const province = provinces.find((p) => p.code === code);
    return province?.name || "";
  };

  const getDistrictName = (code: string) => {
    const district = districts.find((d) => d.code === code);
    return district?.name || "";
  };

  const getWardName = (code: string) => {
    const ward = wards.find((w) => w.code === code);
    return ward?.name || "";
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Đăng ký thành công!
              </h3>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đăng ký trở thành đối tác. Chúng tôi sẽ liên hệ
                với bạn trong thời gian sớm nhất.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký trở thành đối tác
          </h1>
          <p className="text-gray-600">
            Vui lòng điền đầy đủ thông tin để chúng tôi có thể hỗ trợ bạn tốt
            nhất
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Bước {currentStep} / {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Thông tin cơ bản"}
              {currentStep === 2 && "Thông tin địa chỉ"}
              {currentStep === 3 && "Thông tin bổ sung"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 &&
                "Vui lòng cung cấp thông tin cơ bản về công ty và người đăng ký"}
              {currentStep === 2 &&
                "Vui lòng cung cấp địa chỉ chi tiết của công ty"}
              {currentStep === 3 &&
                "Vui lòng cung cấp thông tin bổ sung về công ty"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Tên công ty *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      handleInputChange("company_name", e.target.value)
                    }
                    placeholder="Nhập tên công ty"
                    className={errors.company_name ? "border-red-500" : ""}
                  />
                  {errors.company_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.company_name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="registrant_name">Tên người đăng ký *</Label>
                  <Input
                    id="registrant_name"
                    value={formData.registrant_name}
                    onChange={(e) =>
                      handleInputChange("registrant_name", e.target.value)
                    }
                    placeholder="Nhập tên người đăng ký"
                    className={errors.registrant_name ? "border-red-500" : ""}
                  />
                  {errors.registrant_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.registrant_name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="example@company.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="0123456789"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Số nhà, tên đường, thôn/xóm..."
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) =>
                        handleInputChange("province", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.province ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.province}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="district">Quận/Huyện *</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) =>
                        handleInputChange("district", value)
                      }
                      disabled={!formData.province || loadingAddress}
                    >
                      <SelectTrigger
                        className={errors.district ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Chọn quận/huyện" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.code} value={district.code}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.district}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ward">Phường/Xã *</Label>
                    <Select
                      value={formData.ward}
                      onValueChange={(value) =>
                        handleInputChange("ward", value)
                      }
                      disabled={!formData.district || loadingAddress}
                    >
                      <SelectTrigger
                        className={errors.ward ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Chọn phường/xã" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((ward) => (
                          <SelectItem key={ward.code} value={ward.code}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ward && (
                      <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                    )}
                  </div>
                </div>

                {formData.province && formData.district && formData.ward && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Địa chỉ đã chọn:</strong> {formData.address},{" "}
                      {getWardName(formData.ward)},{" "}
                      {getDistrictName(formData.district)},{" "}
                      {getProvinceName(formData.province)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tax_code">Mã số thuế</Label>
                    <Input
                      id="tax_code"
                      value={formData.tax_code}
                      onChange={(e) =>
                        handleInputChange("tax_code", e.target.value)
                      }
                      placeholder="Nhập mã số thuế"
                    />
                  </div>

                  <div>
                    <Label htmlFor="licence_number">
                      Số giấy phép kinh doanh
                    </Label>
                    <Input
                      id="licence_number"
                      value={formData.licence_number}
                      onChange={(e) =>
                        handleInputChange("licence_number", e.target.value)
                      }
                      placeholder="Nhập số giấy phép"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="establish_year">Năm thành lập</Label>
                  <Select
                    value={formData.establish_year.toString()}
                    onValueChange={(value) =>
                      handleInputChange("establish_year", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn năm thành lập" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: 50 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="desc">Mô tả về công ty</Label>
                  <Textarea
                    id="desc"
                    value={formData.desc}
                    onChange={(e) => handleInputChange("desc", e.target.value)}
                    placeholder="Mô tả về lĩnh vực hoạt động, quy mô công ty, kinh nghiệm..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Quay lại
              </Button>

              {currentStep < TOTAL_STEPS ? (
                <Button onClick={handleNext}>Tiếp theo</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi đăng ký"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
