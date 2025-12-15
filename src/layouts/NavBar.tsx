import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Modal from "../components/Modal";
import LoginForm from "../components/authentication/LoginForm";
import SignupForm from "../components/authentication/SignupForm";

import { useAuth } from "../hooks/useAuth";
import { fetchActiveTourCategories } from "../services/tourCategory.service";
import { getAllCategories } from "../services/blogCategory.service";
import SearchBar from "../components/SearchBar";

export const NavBar = ({ textDark = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const navigate = useNavigate();

  // Remove mock user state
  const { user } = useAuth();
  const { logout } = useAuth();

  const [tourCategories, setTourCategories] = useState<any[]>([]);
  const [blogCategories, setBlogCategories] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchActiveTourCategories().then((res) => {
      setTourCategories(res);
    });
    getAllCategories({ is_active: true }).then((res) => {
      console.log(res);
      setBlogCategories(res);
    });
  }, []);

  const handleDropdownToggle = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <>
      <nav
        className={`border-b border-white/10 monserrat fixed w-full z-40 transition-all duration-300 ${
          isScrolled ? "bg-white/95 shadow-lg" : "bg-white/10"
        }`}
        style={{ top: isScrolled ? "0px" : "44px" }}
        onMouseLeave={closeDropdowns}
      >
        <div className={`container mx-auto px-4 py-4`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="/VieTour-Logo.png"
                  alt="VieTour Logo"
                  className={`h-12 w-auto transition-all duration-300 ${
                    !isScrolled && !textDark ? "brightness-0 invert" : ""
                  }`}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center font-semibold">
              <Link
                to="/"
                className={`px-2 py-2 hover:text-orange-500 transition-colors ${
                  isScrolled || textDark ? "text-gray-700" : "text-white"
                }`}
              >
                TRANG CHỦ
              </Link>
              <Link
                to="/about"
                className={`px-2 py-2 hover:text-orange-500 transition-colors ${
                  isScrolled || textDark ? "text-gray-700" : "text-white"
                }`}
              >
                GIỚI THIỆU
              </Link>
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle("tour")}
                  onMouseEnter={() => setActiveDropdown("tour")}
                  className={`px-2 py-2 flex items-center space-x-1 hover:text-orange-500 transition-colors ${
                    isScrolled || textDark ? "text-gray-700" : "text-white"
                  }`}
                >
                  <span>TOUR</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      activeDropdown === "tour" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === "tour" && (
                  <div
                    className={`absolute top-full left-0 mt-4 w-56 shadow-md py-2 z-50 backdrop-blur-sm ${
                      isScrolled || textDark ? "bg-white" : "bg-white/10"
                    }`}
                    onMouseEnter={() => setActiveDropdown("tour")}
                  >
                    {tourCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/tour-category/${cat.slug}`}
                        className={`block px-4 py-2 transition-colors ${
                          isScrolled || textDark
                            ? "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                            : "text-white hover:bg-white/20 hover:text-orange-300"
                        }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle("blog")}
                  onMouseEnter={() => setActiveDropdown("blog")}
                  className={`px-2 py-2 flex items-center space-x-1 hover:text-orange-500 transition-colors ${
                    isScrolled || textDark ? "text-gray-700" : "text-white"
                  }`}
                >
                  <span>BLOG</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      activeDropdown === "blog" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {activeDropdown === "blog" && (
                  <div
                    className={`absolute top-full left-0 mt-4 w-56 shadow-md py-2 z-50 backdrop-blur-sm ${
                      isScrolled || textDark ? "bg-white" : "bg-white/10"
                    }`}
                    onMouseEnter={() => setActiveDropdown("blog")}
                  >
                    {blogCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/blog-category/${cat.slug}`}
                        className={`block px-4 py-2 transition-colors ${
                          isScrolled || textDark
                            ? "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                            : "text-white hover:bg-white/20 hover:text-orange-300"
                        }`}
                      >
                        {cat.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to="/pricing"
                className={`px-2 py-2 hover:text-orange-500 transition-colors ${
                  isScrolled || textDark ? "text-gray-700" : "text-white"
                }`}
              >
                BẢNG GIÁ
              </Link>
              <Link
                to="/gallery"
                className={`px-2 py-2 hover:text-orange-500 transition-colors ${
                  isScrolled || textDark ? "text-gray-700" : "text-white"
                }`}
              >
                HÌNH ẢNH
              </Link>
              <Link
                to="/contact"
                className={`px-2 py-2 hover:text-orange-500 transition-colors ${
                  isScrolled || textDark ? "text-gray-700" : "text-white"
                }`}
              >
                LIÊN HỆ
              </Link>
            </div>

            {/* Search and User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <SearchBar
                  isScrolled={isScrolled}
                  textDark={textDark}
                  className="w-70"
                />
              </div>
              {/* User Menu */}
              <div className="relative hidden md:block flex items-center gap-2">
                {user && user.role === "user" ? (
                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle("user")}
                      onMouseEnter={() => setActiveDropdown("user")}
                      className={`px-3 py-2 flex items-center space-x-2 hover:text-orange-500 transition-colors ${
                        isScrolled || textDark ? "text-gray-700" : "text-white"
                      }`}
                    >
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.first_name?.charAt(0) || "U"
                        )}
                      </div>
                      <span className="text-sm">
                        {user?.first_name + " " + user?.last_name || "Unknown"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          activeDropdown === "user" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* User Dropdown Menu */}
                    {activeDropdown === "user" && (
                      <div
                        className={`absolute top-full right-0 mt-4 w-48 shadow-lg py-2 z-50 backdrop-blur-sm ${
                          isScrolled || textDark ? "bg-white" : "bg-white/10"
                        }`}
                        onMouseEnter={() => setActiveDropdown("user")}
                      >
                        <Link
                          to="/user/profile"
                          className={`block px-4 py-2 transition-colors ${
                            isScrolled || textDark
                              ? "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                              : "text-white hover:bg-white/20 hover:text-orange-300"
                          }`}
                        >
                          Hồ sơ
                        </Link>
                        <Link
                          to="/user/my-bookings"
                          className={`block px-4 py-2 transition-colors ${
                            isScrolled || textDark
                              ? "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                              : "text-white hover:bg-white/20 hover:text-orange-300"
                          }`}
                        >
                          Tour đã đặt
                        </Link>
                        <Link
                          to="/user/password"
                          className={`block px-4 py-2 transition-colors ${
                            isScrolled || textDark
                              ? "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                              : "text-white hover:bg-white/20 hover:text-orange-300"
                          }`}
                        >
                          Thay đổi mật khẩu
                        </Link>
                        <Link
                          to="chat"
                          className={`block px-4 py-2 transition-colors ${
                            isScrolled || textDark
                              ? "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                              : "text-white hover:bg-white/20 hover:text-orange-300"
                          }`}
                        >
                          Liên hệ hỗ trợ
                        </Link>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            logout();
                          }}
                          className={`block px-4 py-2 transition-colors ${
                            isScrolled || textDark
                              ? "text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                              : "text-white hover:bg-white/20 hover:text-orange-300"
                          }`}
                        >
                          Đăng xuất
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setShowSignupModal(false);
                      }}
                      className={`px-2 py-2 text-sm hover:text-orange-500 transition-colors ${
                        isScrolled || textDark ? "text-gray-700" : "text-white"
                      }`}
                    >
                      Đăng nhập
                    </button>
                    <span
                      className={`text-gray-400 select-none ${
                        isScrolled || textDark ? "text-gray-700" : "text-white"
                      }`}
                    >
                      /
                    </span>
                    <button
                      onClick={() => {
                        setShowSignupModal(true);
                        setShowLoginModal(false);
                      }}
                      className={`px-2 py-2 text-sm hover:text-orange-500 transition-colors ${
                        isScrolled || textDark ? "text-gray-700" : "text-white"
                      }`}
                    >
                      Đăng ký
                    </button>
                  </>
                )}
              </div>
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`hover:text-orange-500 ${
                    isScrolled || textDark ? "text-gray-700" : "text-white"
                  }`}
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                {/* Mobile Search Bar */}
                <div className="px-3 py-2">
                  <SearchBar
                    isScrolled={true}
                    textDark={true}
                    placeholder="Tìm kiếm tour..."
                  />
                </div>
                <Link
                  to="/"
                  className="block px-2 py-2 text-gray-700 hover:text-orange-500"
                >
                  TRANG CHỦ
                </Link>
                <Link
                  to="/about"
                  className="block px-2 py-2 text-gray-700 hover:text-orange-500"
                >
                  GIỚI THIỆU
                </Link>
                <div className="px-3 py-2">
                  <div className="text-gray-700 font-medium mb-2">TOUR</div>
                  <div className="pl-4 space-y-1">
                    {tourCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/tour-category/${cat.slug}`}
                        className="block py-1 text-gray-600 hover:text-orange-500"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="text-gray-700 font-medium mb-2">BLOG</div>
                  <div className="pl-4 space-y-1">
                    {blogCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/blog-category/${cat.slug}`}
                        className="block py-1 text-gray-600 hover:text-orange-500"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link
                  to="/pricing"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-500"
                >
                  BẢNG GIÁ
                </Link>
                <Link
                  to="/booking"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-500"
                >
                  ĐẶT TOUR
                </Link>
                <Link
                  to="/blog"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-500"
                >
                  BLOG
                </Link>
                <Link
                  to="/gallery"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-500"
                >
                  HÌNH ẢNH
                </Link>
                <Link
                  to="/register-partner"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-500"
                >
                  LIÊN HỆ
                </Link>
                {/* Mobile User Menu */}
                <div className="border-t pt-2 mt-2">
                  {user && user.role === "user" ? (
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={`${user.first_name} ${user.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user?.first_name?.charAt(0)
                          )}
                        </div>
                        <span className="text-gray-700 font-medium">
                          {user?.first_name || "Unknown"}
                        </span>
                      </div>
                      <div className="pl-4 space-y-1">
                        <Link
                          to="/user/profile"
                          className="block py-1 text-gray-600 hover:text-orange-500"
                        >
                          Hồ sơ
                        </Link>
                        <Link
                          to="/user/my-bookings"
                          className="block py-1 text-gray-600 hover:text-orange-500"
                        >
                          Tour đã đặt
                        </Link>
                        <Link
                          to="/user/password"
                          className="block py-1 text-gray-600 hover:text-orange-500"
                        >
                          Thay đổi mật khẩu
                        </Link>
    
                        <a
                          href="#"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await logout();
                            } catch (error) {
                              console.error("Logout failed:", error);
                            }
                          }}
                          className="block py-1 text-gray-600 hover:text-orange-500"
                        >
                          Đăng xuất
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowLoginModal(true);
                          setShowSignupModal(false);
                        }}
                        className="px-2 py-2 text-sm text-gray-700 hover:text-orange-500"
                      >
                        Đăng nhập
                      </button>
                      <span className="text-gray-400 select-none">/</span>
                      <button
                        onClick={() => {
                          setShowSignupModal(true);
                          setShowLoginModal(false);
                        }}
                        className="px-2 py-2 text-sm text-gray-700 hover:text-orange-500"
                      >
                        Đăng ký
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <LoginForm
          onClose={() => setShowLoginModal(false)}
          onSwitchForm={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          onForgotPassword={() => {
            setShowLoginModal(false);
            navigate("/reset-password");
          }}
        />
      </Modal>
      <Modal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)}>
        <SignupForm
          onClose={() => setShowSignupModal(false)}
          onSwitchForm={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      </Modal>
    </>
  );
};
