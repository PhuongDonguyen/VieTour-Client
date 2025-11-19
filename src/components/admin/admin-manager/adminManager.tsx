import React, { useState, useEffect, useRef } from 'react';
import { getUsers, getUsersSearch, banAccountService, unbanAccountService, type GetUsersResponse, type GetProvidersResponse, type User, type Provider } from '@/services/adminManager.service';
import { fetchAllToursByProviderId } from '@/services/tour.service';
import type { TourResponse } from '@/apis/tour.api';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import UserManagementHeader from './UserManagementHeader';
import UserManagementActions from './UserManagementActions';
import UserTable from './UserTable';
import ProviderTable from './ProviderTable';
import UserPagination from './UserPagination';
import BanAccountModal from './BanAccountModal';
import ProviderToursModal from './ProviderToursModal';
import AccountDetailModal from './AccountDetailModal';

const PAGE_SIZE = 8;
const PROVIDER_TOURS_PAGE_SIZE = 6;

type Role = 'user' | 'provider';

const UserManagement = () => {
  const [role, setRole] = useState<Role>('user');
  const [userData, setUserData] = useState<GetUsersResponse | GetProvidersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [appliedSearch, setAppliedSearch] = useState('');
  const [banFilter, setBanFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<User | Provider | null>(null);
  const [banLoading, setBanLoading] = useState(false);
  const [isBanFilterOpen, setIsBanFilterOpen] = useState(false);
  const [providerToursModalOpen, setProviderToursModalOpen] = useState(false);
  const [selectedProviderForTours, setSelectedProviderForTours] = useState<Provider | null>(null);
  const [providerTours, setProviderTours] = useState<TourResponse['data']>([]);
  const [providerToursPagination, setProviderToursPagination] = useState<TourResponse['pagination'] | null>(null);
  const [providerToursLoading, setProviderToursLoading] = useState(false);
  const [providerToursCurrentPage, setProviderToursCurrentPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<User | Provider | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const banFilterValue =
          banFilter === 'banned' ? true : banFilter === 'active' ? false : undefined;
        let response: GetUsersResponse | GetProvidersResponse;
        if (isSearchMode && appliedSearch.trim()) {
          response = await getUsersSearch(
            appliedSearch.trim(),
            currentPage,
            PAGE_SIZE,
            role,
            banFilterValue
          );
        } else {
          response = await getUsers({ 
            page: currentPage, 
            limit: PAGE_SIZE,
          }, role, banFilterValue);
        }
        console.log("Response:", response);
        setUserData(response);
      } catch (error: any) {
        const errorMessage = role === 'user' 
          ? 'Lỗi khi tải danh sách người dùng' 
          : 'Lỗi khi tải danh sách nhà cung cấp';
        toast.error(error.message || errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, isSearchMode, appliedSearch, role, banFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBanFilterOpen(false);
      }
    };

    if (isBanFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBanFilterOpen]);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setIsSearchMode(false);
    setAppliedSearch('');
    setSearchTerm('');
    setBanFilter('all');
    setIsBanFilterOpen(false);
    setCurrentPage(1);
    // Reset data khi chuyển role để tránh hiển thị data sai type
    setUserData(null);
    setLoading(true);
  };

  // Helper function để kiểm tra type an toàn
  // Nếu data rỗng, chỉ cần kiểm tra dựa trên role hiện tại
  const isUserResponse = (data: GetUsersResponse | GetProvidersResponse | null): data is GetUsersResponse => {
    if (!data || !data.data) return false;
    // Nếu data rỗng, không thể xác định type từ data, nhưng có thể dựa vào role
    if (data.data.length === 0) {
      // Nếu role là user, giả định đây là UserResponse (data rỗng)
      return role === 'user';
    }
    const firstItem = data.data[0];
    return 'first_name' in firstItem && 'last_name' in firstItem;
  };

  const isProviderResponse = (data: GetUsersResponse | GetProvidersResponse | null): data is GetProvidersResponse => {
    if (!data || !data.data) return false;
    // Nếu data rỗng, không thể xác định type từ data, nhưng có thể dựa vào role
    if (data.data.length === 0) {
      // Nếu role là provider, giả định đây là ProviderResponse (data rỗng)
      return role === 'provider';
    }
    const firstItem = data.data[0];
    return 'company_name' in firstItem && !('first_name' in firstItem);
  };

  // Lấy data an toàn dựa trên role và type của userData
  const filteredUsers = (() => {
    if (role !== 'user') return [];
    if (!userData || !isUserResponse(userData)) return [];
    return userData.data;
  })();

  const filteredProviders = (() => {
    if (role !== 'provider') return [];
    if (!userData || !isProviderResponse(userData)) return [];
    return userData.data;
  })();

  const handleSearchSubmit = () => {
    const q = searchTerm.trim();
    if (!q) return;
    setAppliedSearch(q);
    setIsSearchMode(true);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setAppliedSearch('');
    setCurrentPage(1);
  };

  const handleBanFilterChange = (value: 'all' | 'active' | 'banned') => {
    setBanFilter(value);
    setCurrentPage(1);
    setIsBanFilterOpen(false);
  };

  const handleToggleBanUser = (user: User) => {
    setSelectedAccount(user);
    setBanModalOpen(true);
  };

  const handleToggleBanProvider = (provider: Provider) => {
    setSelectedAccount(provider);
    setBanModalOpen(true);
  };

  const loadProviderTours = async (provider: Provider, page: number = 1) => {
    try {
      setProviderToursLoading(true);
      const response = await fetchAllToursByProviderId(provider.id, page, PROVIDER_TOURS_PAGE_SIZE);

      if (response?.success) {
        setProviderTours(response.data ?? []);
        setProviderToursPagination(response.pagination ?? null);
        setProviderToursCurrentPage(response.pagination?.page ?? page);
      } else {
        setProviderTours([]);
        setProviderToursPagination(null);
        toast.error('Không lấy được danh sách tour của nhà cung cấp');
      }
    } catch (error: any) {
      console.error('Failed to load provider tours:', error);
      setProviderTours([]);
      setProviderToursPagination(null);
      toast.error(error.message || 'Không tải được danh sách tour của nhà cung cấp');
    } finally {
      setProviderToursLoading(false);
    }
  };

  const handleViewProviderTours = (provider: Provider) => {
    setSelectedProviderForTours(provider);
    setProviderToursModalOpen(true);
    setProviderTours([]);
    setProviderToursPagination(null);
    setProviderToursCurrentPage(1);
    void loadProviderTours(provider, 1);
  };

  const handleProviderToursPageChange = (page: number) => {
    if (!selectedProviderForTours) return;
    setProviderToursCurrentPage(page);
    void loadProviderTours(selectedProviderForTours, page);
  };

  const handleCloseProviderToursModal = () => {
    setProviderToursModalOpen(false);
    setSelectedProviderForTours(null);
    setProviderTours([]);
    setProviderToursPagination(null);
    setProviderToursCurrentPage(1);
  };

  const handleViewAccountDetail = (account: User | Provider) => {
    setSelectedAccountForDetail(account);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedAccountForDetail(null);
  };

  const handleConfirmBan = async () => {
    if (!selectedAccount) return;
    const accountId = selectedAccount.account_id ?? selectedAccount.id;
    if (!accountId) {
      toast.error('Không tìm thấy tài khoản');
      return;
    }

    try {
      setBanLoading(true);
      if (selectedAccount.is_banned) {
        await unbanAccountService(accountId);
        toast.success('Gỡ cấm tài khoản thành công');
      } else {
        await banAccountService(accountId);
        toast.success('Cấm tài khoản thành công');
      }
      setBanModalOpen(false);
      setSelectedAccount(null);
      
      // Refresh data list
      const banFilterValue =
        banFilter === 'banned' ? true : banFilter === 'active' ? false : undefined;
      const response = isSearchMode && appliedSearch.trim()
        ? await getUsersSearch(appliedSearch.trim(), currentPage, PAGE_SIZE, role, banFilterValue)
        : await getUsers({ page: currentPage, limit: PAGE_SIZE }, role, banFilterValue);
      setUserData(response);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật trạng thái tài khoản');
    } finally {
      setBanLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white">
      <div className="w-full h-full p-6">
        <UserManagementHeader />
        
        {/* Role Selector */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => handleRoleChange('user')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                role === 'user'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Người dùng
            </button>
            <button
              onClick={() => handleRoleChange('provider')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                role === 'provider'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Nhà cung cấp
            </button>
          </div>
        </div>
        
        <UserManagementActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          isSearching={isSearchMode}
          onClearSearch={handleClearSearch}
        />

        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <span className="text-sm font-medium text-gray-700">Lọc trạng thái tài khoản</span>
          <div
            ref={filterDropdownRef}
            className="relative mt-1 w-full md:mt-0 md:max-w-xs"
          >
            <button
              type="button"
              onClick={() => setIsBanFilterOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {banFilter === 'all'
                ? 'Tất cả'
                : banFilter === 'active'
                  ? 'Tài khoản đang hoạt động'
                  : 'Tài khoản bị cấm'}
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  isBanFilterOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isBanFilterOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-2xl">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'active', label: 'Tài khoản đang hoạt động' },
                  { value: 'banned', label: 'Tài khoản bị cấm' },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`block w-full px-4 py-3 text-left text-sm font-medium transition first:rounded-t-2xl last:rounded-b-2xl ${
                      banFilter === option.value
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => handleBanFilterChange(option.value as 'all' | 'active' | 'banned')}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {role === 'user' ? (
          <UserTable
            users={filteredUsers}
            loading={loading}
            formatDate={formatDate}
            onToggleBan={handleToggleBanUser}
            onViewDetail={handleViewAccountDetail}
          />
        ) : (
          <ProviderTable
            providers={filteredProviders}
            loading={loading}
            formatDate={formatDate}
            onToggleBan={handleToggleBanProvider}
            onViewProviderTours={handleViewProviderTours}
            onViewDetail={handleViewAccountDetail}
          />
        )}

        {userData && (
          <UserPagination
            pagination={userData.pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            filteredUsersCount={role === 'user' ? filteredUsers.length : filteredProviders.length}
          />
        )}

        <BanAccountModal
          isOpen={banModalOpen}
          account={selectedAccount}
          accountType={role}
          onClose={() => {
            setBanModalOpen(false);
            setSelectedAccount(null);
          }}
          onConfirm={handleConfirmBan}
          loading={banLoading}
        />
        <ProviderToursModal
          isOpen={providerToursModalOpen}
          provider={selectedProviderForTours}
          tours={providerTours}
          loading={providerToursLoading}
          pagination={providerToursPagination}
          currentPage={providerToursCurrentPage}
          onClose={handleCloseProviderToursModal}
          onPageChange={handleProviderToursPageChange}
        />
        <AccountDetailModal
          isOpen={detailModalOpen}
          account={selectedAccountForDetail}
          accountType={role}
          onClose={handleCloseDetailModal}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default UserManagement;