import { useEffect, useState } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Link } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

interface DropdownItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Mock user state - replace with actual auth context
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Navigation data
  const navigationData: NavItem[] = [
    {
      id: 'home',
      label: 'TRANG CHỦ',
      href: '/',
    },
    {
      id: 'about',
      label: 'GIỚI THIỆU',
      href: '/about',
    },
    {
      id: 'tour',
      label: 'TOUR',
      href: '/tours',
      hasDropdown: true,
      dropdownItems: [
        {
          id: 'day-tour',
          label: 'Tour trong ngày',
          href: '/tours/day-tours',
          description: 'Khám phá điểm đến gần TP.HCM'
        },
        {
          id: 'mekong',
          label: 'Tour miền Tây',
          href: '/tours/mekong',
          description: 'Trải nghiệm văn hóa sông nước miền Tây'
        },
        {
          id: 'north',
          label: 'Tour Cao Bắc',
          href: '/tours/north',
          description: 'Khám phá vẻ đẹp núi rừng miền Bắc'
        },
        {
          id: 'central',
          label: 'Tour miền Trung',
          href: '/tours/central',
          description: 'Di sản văn hóa và bãi biển đẹp'
        },
        {
          id: 'south',
          label: 'Tour miền Nam',
          href: '/tours/south',
          description: 'Đô thị hiện đại và văn hóa Nam Bộ'
        },
        {
          id: 'international',
          label: 'Tour quốc tế',
          href: '/tours/international',
          description: 'Khám phá các quốc gia Đông Nam Á'
        }
      ]
    },
    {
      id: 'pricing',
      label: 'BẢNG GIÁ',
      href: '/pricing',
    },
    {
      id: 'booking',
      label: 'ĐẶT TOUR',
      href: '/booking',
    },
    {
      id: 'blog',
      label: 'BLOG',
      href: '/blog',
    },
    {
      id: 'gallery',
      label: 'HÌNH ẢNH',
      href: '/gallery',
    },
    {
      id: 'contact',
      label: 'LIÊN HỆ',
      href: '/contact',
    }
  ];

  const mobileNavigationData: NavItem[] = [
    {
      id: 'home',
      label: 'TRANG CHỦ',
      href: '/',
    },
    {
      id: 'about',
      label: 'GIỚI THIỆU',
      href: '/about',
    },
    {
      id: 'tour',
      label: 'TOUR',
      href: '/tours',
      hasDropdown: true,
      dropdownItems: [
        { id: 'day-tour', label: 'Tour trong ngày', href: '/tours/day-tours' },
        { id: 'mekong', label: 'Tour miền Tây', href: '/tours/mekong' },
        { id: 'north', label: 'Tour Cao Bắc', href: '/tours/north' },
        { id: 'central', label: 'Tour miền Trung', href: '/tours/central' },
        { id: 'south', label: 'Tour miền Nam', href: '/tours/south' },
        { id: 'international', label: 'Tour quốc tế', href: '/tours/international' }
      ]
    },
    {
      id: 'pricing',
      label: 'BẢNG GIÁ',
      href: '/pricing',
    },
    {
      id: 'booking',
      label: 'ĐẶT TOUR',
      href: '/booking',
    },
    {
      id: 'blog',
      label: 'BLOG',
      href: '/blog',
    },
    {
      id: 'gallery',
      label: 'HÌNH ẢNH',
      href: '/gallery',
    },
    {
      id: 'contact',
      label: 'LIÊN HỆ',
      href: '/contact',
    }
  ];

  const userNavigationData = {
    authenticated: [
      {
        id: 'profile',
        label: 'Hồ sơ',
        href: '/profile',
      },
      {
        id: 'bookings',
        label: 'Đặt tour của tôi',
        href: '/my-bookings',
      },
      {
        id: 'favorites',
        label: 'Yêu thích',
        href: '/favorites',
      },
      {
        id: 'logout',
        label: 'Đăng xuất',
        href: '/logout',
      }
    ],
    unauthenticated: [
      {
        id: 'login',
        label: 'Đăng nhập',
        href: '/login',
      }
    ]
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDropdownToggle = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <nav 
      className={`fixed w-full z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 shadow-lg' : 'bg-black/5'
      }`} 
      style={{ top: isScrolled ? '0px' : '40px' }}
      onMouseLeave={closeDropdowns}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img 
                src="/VieTour-Logo.png" 
                alt="VieTour Logo" 
                className="h-11 w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {navigationData.map((item: NavItem) => (
              <div key={item.id}>
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle(item.id)}
                      onMouseEnter={() => setActiveDropdown(item.id)}
                      className={`px-3 py-2 flex items-center space-x-1 hover:text-orange-500 transition-colors ${
                        isScrolled ? 'text-gray-700' : 'text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        activeDropdown === item.id ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeDropdown === item.id && item.dropdownItems && (
                      <div 
                        className={`absolute top-full left-0 mt-4 w-48 shadow-lg py-2 z-50 backdrop-blur-sm ${
                          isScrolled ? 'bg-white' : 'bg-white/10'
                        }`}
                        onMouseEnter={() => setActiveDropdown(item.id)}
                      >
                        {item.dropdownItems.map((dropdownItem: DropdownItem) => (
                          <a 
                            key={dropdownItem.id}
                            href={dropdownItem.href} 
                            className={`block px-4 py-2 transition-colors ${
                              isScrolled 
                                ? 'text-gray-700 hover:bg-orange-50 hover:text-orange-500' 
                                : 'text-white hover:bg-white/20 hover:text-orange-300'
                            }`}
                          >
                            {dropdownItem.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a 
                    href={item.href} 
                    className={`px-3 py-2 hover:text-orange-500 transition-colors ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Search and User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Tìm kiếm tour..."
                className={`pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:border-orange-500 ${
                  isScrolled 
                    ? 'border-gray-300 bg-white text-gray-800 placeholder-gray-500' 
                    : 'border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70'
                }`}
              />
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${
                isScrolled ? 'text-gray-400' : 'text-white/70'
              }`} />
            </div>
            
            {/* User Menu */}
            <div className="relative hidden md:block">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => handleDropdownToggle('user')}
                    onMouseEnter={() => setActiveDropdown('user')}
                    className={`px-3 py-2 flex items-center space-x-2 hover:text-orange-500 transition-colors ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm">{user?.name || 'User'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      activeDropdown === 'user' ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {activeDropdown === 'user' && (
                    <div 
                      className={`absolute top-full right-0 mt-4 w-48 shadow-lg py-2 z-50 backdrop-blur-sm ${
                        isScrolled ? 'bg-white' : 'bg-white/10'
                      }`}
                      onMouseEnter={() => setActiveDropdown('user')}
                    >
                      {userNavigationData.authenticated.map((item: any) => (
                        <a 
                          key={item.id}
                          href={item.href} 
                          className={`block px-4 py-2 transition-colors ${
                            isScrolled 
                              ? 'text-gray-700 hover:bg-orange-50 hover:text-orange-500' 
                              : 'text-white hover:bg-white/20 hover:text-orange-300'
                          }`}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login"
                  className={`px-3 py-2 text-sm hover:text-orange-500 transition-colors ${
                    isScrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`hover:text-orange-500 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {mobileNavigationData.map((item: NavItem) => (
                <div key={item.id}>
                  {item.hasDropdown ? (
                    <div className="px-3 py-2">
                      <div className="text-gray-700 font-medium mb-2">{item.label}</div>
                      <div className="pl-4 space-y-1">
                        {item.dropdownItems?.map((dropdownItem: DropdownItem) => (
                          <a 
                            key={dropdownItem.id}
                            href={dropdownItem.href} 
                            className="block py-1 text-gray-600 hover:text-orange-500"
                          >
                            {dropdownItem.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a 
                      href={item.href} 
                      className="block px-3 py-2 text-gray-700 hover:text-orange-500"
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
              
              {/* Mobile User Menu */}
              <div className="border-t pt-2 mt-2">
                {isAuthenticated ? (
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-gray-700 font-medium">{user?.name || 'User'}</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {userNavigationData.authenticated.map((item: any) => (
                        <a 
                          key={item.id}
                          href={item.href} 
                          className="block py-1 text-gray-600 hover:text-orange-500"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-orange-500"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
