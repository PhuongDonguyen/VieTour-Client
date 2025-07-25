import React, { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  fetchUserProfile,
  updateUserProfile,
} from "../services/userProfile.service";
import axios from "axios";
import type { userProfile } from "../apis/userProfile.api";
// Types
interface FormData {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  avatar?: File | null;
}

interface Passwords {
  current: string;
  new: string;
  confirm: string;
}

interface ButtonState {
  loading: boolean;
  success: boolean;
  fail: boolean;
}

interface ButtonStates {
  updateInfo: ButtonState;
  changePassword: ButtonState;
}

interface Province {
  code: number;
  name: string;
}

interface District {
  code: number;
  name: string;
}

interface Ward {
  code: number;
  name: string;
}

// interface FormData {
//   province: string;
//   district: string;
//   ward: string;
// }



type PasswordField = keyof Passwords;
type FormField = keyof FormData;

export const ProfilePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>();

  const [passwords, setPasswords] = useState<Passwords>({
    current: "",
    new: "",
    confirm: "",
  });

  const [buttonStates, setButtonStates] = useState<ButtonStates>({
    updateInfo: { loading: false, success: false, fail: false },
    changePassword: { loading: false, success: false, fail: false },
  });

  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [avatar, setAvatar] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = (): void => {
      setScrollOffset(window.pageYOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [userId, setUserId] = useState<number>();

  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const API_HOST = "https://provinces.open-api.vn/api";

  useEffect(() => {
    axios.get(`${API_HOST}/?depth=1`).then((res) => {
      setProvinces(res.data);
      console.log(res.data);
    });
  }, []);

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = Number(e.target.value);
    const province = provinces.find((p) => p.code === code) || null;
    console.log("province: ", province);
    setFormData((prev) => ({
      ...prev!,
      province: province?.name ?? "",
      district: "",
      ward: "",
    }));
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);

    if (province) {
      const res = await axios.get(`${API_HOST}/p/${province.code}?depth=2`);
      setDistricts(res.data.districts);
      setWards([]);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = Number(e.target.value);
    const district = districts.find((d) => d.code === code) || null;
    setSelectedDistrict(district);
    setSelectedWard(null);
    setFormData((prev) => ({
      ...prev!,
      district: district?.name ?? "",
      ward: "",
    }));
    console.log("district: ", district);
    if (district) {
      const res = await axios.get(`${API_HOST}/d/${district.code}?depth=2`);
      console.log(`${API_HOST}/d/${district.code}?depth=2`);
      setWards(res.data.wards);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const ward = wards.find((w) => w.code === code) || null;
    setFormData((prev) => ({
      ...prev!,
      ward: ward?.name ?? "",
    }));
    setSelectedWard(ward);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Đã đổi");
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        // TODO: Gửi avatar lên server ở đây nếu cần
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchUserProfile();
        const data = res.data;
        console.log("data district: ", data);
        setUserId(data.id);

        setFormData({
          firstName: data.first_name,
          lastName: data.last_name,
          address: data.address,
          phone: data.phone,
          province: data.province,
          district: data.district,
          ward: data.ward,
        });
        setAvatar(data.avatar);
        if (data.province != "") {
          const province =
            provinces.find((p) => p.name == data.province) || null;
          setSelectedProvince(province);
          console.log("Load province code: ", province?.code);
          if (province) {
            const res = await axios.get(
              `${API_HOST}/p/${province.code}?depth=2`
            );
            setDistricts(res.data.districts);
            setWards([]);
          }
        }
      } catch (error) {}
    };
    fetchData();
  }, [provinces]);

  useEffect(() => {
    const loadDistrict = async () => {
      if (formData?.district != "") {
        const district =
          districts.find((d) => d.name === formData?.district) || null;
        setSelectedDistrict(district);
        console.log("district: ", district);
        if (district) {
          const res = await axios.get(`${API_HOST}/d/${district.code}?depth=2`);
          console.log("wards: ", res.data.wards);
          setWards(res.data.wards);
        }
      }
    };
    loadDistrict();
  }, [districts]);

  useEffect(() => {
    if (formData?.ward != "") {
      const ward = wards.find((w) => w.name === formData?.ward) || null;
      setSelectedWard(ward);
    }
  }, [wards]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name as FormField]: value,
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    console.log(name + "  " + value);
    setPasswords((prev) => ({
      ...prev,
      [name as PasswordField]: value,
    }));
  };

  const updateButtonState = (
    buttonType: keyof ButtonStates,
    newState: Partial<ButtonState>
  ): void => {
    setButtonStates((prev) => ({
      ...prev,
      [buttonType]: { ...prev[buttonType], ...newState },
    }));
  };

  const handleUpdateInfo = async (): Promise<void> => {
    updateButtonState("updateInfo", {
      loading: true,
      success: false,
      fail: false,
    });

    try {
      if (!formData) {
        console.error("formData is undefined");
        return;
      }

      const avatarFile = fileInputRef.current?.files?.[0] ?? null;
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("address", formData.address);
      data.append("phone", formData.phone);
      data.append("province", formData.province);
      data.append("district", formData.district);
      data.append("ward", formData.ward);

      if (avatarFile) {
        data.append("avatar", avatarFile); // avatar là key backend cần
      }
      const profileData: userProfile = {
        ...formData!,
        avatar: avatarFile,
      };

      const res = await updateUserProfile(userId!, profileData); // ✅ truyền đúng FormData
      console.log("formData", res);

      updateButtonState("updateInfo", {
        loading: false,
        success: true,
        fail: false,
      });
    } catch (error) {
      updateButtonState("updateInfo", {
        loading: false,
        success: false,
        fail: true,
      });
    }

    setTimeout(() => {
      updateButtonState("updateInfo", {
        loading: false,
        success: false,
        fail: false,
      });
    }, 3000);
  };

  const validatePasswords = (): boolean => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return false;
    }

    if (passwords.new !== passwords.confirm) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return false;
    }

    return true;
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!validatePasswords()) return;

    updateButtonState("changePassword", { loading: true, success: false });

    // Simulate API call
    setTimeout(() => {
      updateButtonState("changePassword", { loading: false, success: true });

      // Clear form
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });

      setTimeout(() => {
        updateButtonState("changePassword", { loading: false, success: false });
      }, 2000);
    }, 1000);
  };
  const getButtonClasses = (
    buttonState: ButtonState,
    baseClasses: string
  ): string => {
    let stateClasses =
      "bg-gradient-to-r from-blue-500 to-purple-600 text-white";

    if (buttonState.success) {
      stateClasses = "bg-gradient-to-r from-green-500 to-green-600 text-white";
    } else if (buttonState.fail) {
      stateClasses = "bg-gradient-to-r from-red-500 to-red-600 text-white";
    }

    const loadingClasses = buttonState.loading ? "scale-95" : "";

    return `${baseClasses} ${stateClasses} ${loadingClasses}`;
  };

  const getButtonText = (
    buttonState: ButtonState,
    loadingText: string,
    successText: string,
    failText: string,
    defaultText: string
  ): string => {
    if (buttonState.loading) return loadingText;
    if (buttonState.success) return successText;
    if (buttonState.fail) return failText;
    return defaultText;
  };

  return (
    <div className="bg-gradient-to-br bg-white p-5 mt-18">
      <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2">
        {/* Header */}
        <div className="w-32 mx-auto mb-6 text-center">
          <label
            htmlFor="avt"
            className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2"
          >
            Ảnh đại diện
          </label>

          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden transition-transform duration-300 hover:scale-110 mx-auto">
            <img
              src={avatar || "/public/avatar-default.jpg"}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <input
            id="avt"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 rounded"
            onClick={() => fileInputRef.current?.click()}
          >
            Đổi ảnh
          </button>
        </div>

        {/* Content */}
        <div className="p-10">
          {/* Thông tin cá nhân */}
          <div
            className="mb-12 opacity-0 animate-pulse"
            style={{ animation: "fadeInUp 0.6s ease forwards 0.2s" }}
          >
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 pl-6 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              Thông tin cá nhân
            </h2>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Tên
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData?.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Họ
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData?.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="tel"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="number"
                    id="tel"
                    name="phone"
                    value={formData?.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Tỉnh, thành phố
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={selectedProvince?.code || formData?.province}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  >
                    <option value="">
                      {formData?.province || "-- Chọn tỉnh / thành phố --"}
                    </option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Huyện, quận
                  </label>
                  <select
                    id="district"
                    name="district"
                    value={selectedDistrict?.code}
                    onChange={handleDistrictChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    // disabled={!!selectedDistrict}
                  >
                    <option value="">
                      {formData?.district || "-- Chọn huyện / quận --"}
                    </option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="ward"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Xã, thị trấn
                  </label>
                  <select
                    id="ward"
                    name="ward"
                    value={selectedWard?.code}
                    onChange={handleWardChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    // disabled={!!selectedWard}
                  >
                    <option value="">
                      {formData?.ward || "-- Chọn xã / thị trấn --"}
                    </option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div>
                  <label htmlFor="province">Tỉnh / Thành phố</label>
                  <select
                    id="province"
                    className="w-full border rounded px-3 py-2"
                    onChange={handleProvinceChange}
                    value={selectedProvince?.code || ""}
                  >
                    <option value="">Chọn tỉnh / thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div className="space-y-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Địa chỉ
                  </label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData?.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateInfo}
                disabled={buttonStates.updateInfo.loading}
                className={getButtonClasses(
                  buttonStates.updateInfo,
                  "px-8 py-3 rounded-lg font-medium uppercase tracking-wide transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                )}
              >
                {getButtonText(
                  buttonStates.updateInfo,
                  "Đang cập nhật...",
                  "Cập nhật thành công!",
                  "Cập Nhật thất bại!",
                  "Cập nhật thông tin"
                )}
              </button>
            </div>
          </div>





        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fadeInUp {
        animation: fadeInUp 0.5s ease-out;
      }
    `,
        }}
      />
    </div>
  );
};
