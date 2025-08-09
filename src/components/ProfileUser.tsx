import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  fetchUserProfile,
  updateUserProfile,
} from "../services/userProfile.service";
import axios from "axios";
import type { userProfile } from "../apis/userProfile.api";
import { AccountPageSkeleton } from "./AccountSkeleton";
import { toast } from "sonner";

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

export const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatar, setAvatar] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<number>();

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  const API_HOST = "https://vn-public-apis.fpo.vn";

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty, dirtyFields },
    reset,
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      avatar: null,
    },
  });

  // Watch form values
  const watchedValues = watch();

  // Load provinces on mount
  useEffect(() => {
    axios
      .get(`${API_HOST}/provinces/getAll?limit=-1`)
      .then((res) => {
        if (res.data && res.data.exitcode === 1 && res.data.data) {
          setProvinces(res.data.data);
        }
      })
      .catch((error) => {
        console.error("Error loading provinces:", error);
      });
  }, []);

  // Load user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchUserProfile();
        const userData = response.data;
        setUserId(userData.id);
        setAvatar(userData.avatar || "");

        // Set form values
        const formValues = {
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          address: userData.address || "",
          phone: userData.phone || "",
          province: userData.province || "",
          district: userData.district || "",
          ward: userData.ward || "",
          avatar: null,
        };

        // Reset form with user data
        reset(formValues);

        // Load location data if province is set
        if (userData.province) {
          const loadLocationData = async () => {
            try {
              const province = provinces.find(
                (p) => p.name === userData.province
              );
              if (province) {
                setSelectedProvince(province);
                const districtRes = await axios.get(
                  `${API_HOST}/districts/getByProvince?provinceCode=${province.code}&limit=-1`
                );
                if (
                  districtRes.data &&
                  districtRes.data.exitcode === 1 &&
                  districtRes.data.data
                ) {
                  setDistricts(districtRes.data.data);
                }

                if (userData.district) {
                  const district = districtRes.data.districts.find(
                    (d: any) => d.name === userData.district
                  );
                  if (district) {
                    setSelectedDistrict(district);
                    const wardRes = await axios.get(
                      `${API_HOST}/wards/getByDistrict?districtCode=${district.code}&limit=-1`
                    );
                    if (
                      wardRes.data &&
                      wardRes.data.exitcode === 1 &&
                      wardRes.data.data
                    ) {
                      setWards(wardRes.data.data);
                    }

                    if (userData.ward) {
                      const ward = wardRes.data.wards.find(
                        (w: any) => w.name === userData.ward
                      );
                      if (ward) {
                        setSelectedWard(ward);
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error loading location data:", error);
            }
          };

          if (provinces.length > 0) {
            loadLocationData();
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [provinces, reset]);

  // Handle province change
  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = Number(e.target.value);
    const province = provinces.find((p) => p.code === code) || null;

    setValue("province", province?.name ?? "");
    setValue("district", "");
    setValue("ward", "");

    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);

    if (province) {
      try {
        const districtRes = await axios.get(
          `${API_HOST}/districts/getByProvince?provinceCode=${province.code}&limit=-1`
        );
        if (
          districtRes.data &&
          districtRes.data.exitcode === 1 &&
          districtRes.data.data
        ) {
          setDistricts(districtRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    }
  };

  // Handle district change
  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const code = Number(e.target.value);
    const district = districts.find((d) => d.code === code) || null;

    setValue("district", district?.name ?? "");
    setValue("ward", "");

    setSelectedDistrict(district);
    setSelectedWard(null);
    setWards([]);

    if (district) {
      try {
        const wardRes = await axios.get(
          `${API_HOST}/wards/getByDistrict?districtCode=${district.code}&limit=-1`
        );
        if (wardRes.data && wardRes.data.exitcode === 1 && wardRes.data.data) {
          setWards(wardRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    }
  };

  // Handle ward change
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = Number(e.target.value);
    const ward = wards.find((w) => w.code === code) || null;

    setValue("ward", ward?.name ?? "");
    setSelectedWard(ward);
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file, { shouldDirty: true });
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!userId) return;

    setUpdating(true);

    try {
      const updateData: userProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        avatar: data.avatar || null,
      };

      await updateUserProfile(userId, updateData);

      // Reset form to mark as clean
      reset(data);

      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại!");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <AccountPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Thông tin cá nhân
        </h2>
        <p className="text-gray-600 text-sm">
          Cập nhật thông tin hồ sơ của bạn
        </p>
      </div>

      {/* Avatar Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={avatar || "/public/avatar-default.jpg"}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs shadow-lg"
              onClick={() => fileInputRef.current?.click()}
            >
              ✏️
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">
              {watchedValues.firstName} {watchedValues.lastName}
            </h3>
            <p className="text-sm text-blue-600">Cập nhật ảnh đại diện</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tên
            </label>
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Họ
            </label>
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="province"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tỉnh, thành phố
            </label>
            <select
              id="province"
              value={selectedProvince?.code || ""}
              onChange={handleProvinceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="district"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quận, huyện
            </label>
            <select
              id="district"
              value={selectedDistrict?.code || ""}
              onChange={handleDistrictChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedProvince}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ward"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phường, xã
            </label>
            <select
              id="ward"
              value={selectedWard?.code || ""}
              onChange={handleWardChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedDistrict}
            >
              <option value="">Chọn phường/xã</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              id="address"
              {...register("address")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Số nhà, tên đường, phường/xã..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isDirty || updating}
          className={`w-full px-8 py-4 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
            !isDirty || updating
              ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-md"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          {updating ? "Đang cập nhật..." : "Cập nhật thông tin"}
        </button>
      </form>
    </div>
  );
};
