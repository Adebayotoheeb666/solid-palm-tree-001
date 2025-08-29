import React, { useCallback, memo } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MobileNav from "./MobileNav";

interface HeaderProps {
  handleBookNow?: () => void;
}

const Header: React.FC<HeaderProps> = memo(({ handleBookNow }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const defaultHandleBookNow = useCallback(() => {
    // Start with route selection - let users choose to login/register or continue as guest
    navigate("/userform/route");
  }, [navigate]);

  const bookNowHandler = handleBookNow || defaultHandleBookNow;

  const handleLogoClick = useCallback(() => navigate("/"), [navigate]);
  const handleContactClick = useCallback(
    () => navigate("/contact"),
    [navigate],
  );
  const handleDashboardClick = useCallback(
    () => navigate("/dashboard"),
    [navigate],
  );
  const handleLoginClick = useCallback(() => navigate("/login"), [navigate]);
  const handleLogoutClick = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  return (
    <header className="container mx-auto px-4 md:px-12 py-2 md:py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={handleLogoClick}
        >
          <img
            src="/onboard/logos-01.png"
            alt="OnboardTicket Logo"
            className="h-20 sm:h-24 md:h-32 lg:h-40 w-auto max-w-[360px] sm:max-w-[440px] md:max-w-[520px] lg:max-w-[600px] object-contain drop-shadow-sm"
            loading="eager"
            onClick={handleLogoClick}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 md:gap-8">
          <button
            className="px-4 sm:px-6 md:px-8 py-2 text-brand-text-primary font-bold text-base md:text-lg hover:bg-gray-100 rounded-lg transition-colors shadow-none"
            onClick={handleContactClick}
          >
            Get Support
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* User Info Display */}
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-[#3839C9] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                className="px-8 py-2 bg-[#3839C9] text-white font-bold text-base md:text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
                onClick={handleDashboardClick}
              >
                <User className="w-4 h-4" />
                Dashboard
              </button>
              <button
                className="px-8 py-2 text-brand-text-primary font-bold text-base md:text-lg hover:bg-gray-100 rounded-lg transition-colors shadow-none flex items-center gap-2"
                onClick={handleLogoutClick}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              <button
                className="px-4 md:px-6 py-2 text-brand-text-primary font-medium text-sm md:text-base hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => navigate("/guest-booking-lookup")}
              >
                Find Booking
              </button>
              <button
                className="px-8 py-2 bg-[#3839C9] text-white font-bold text-base md:text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                onClick={bookNowHandler}
              >
                Book Ticket
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav handleBookNow={bookNowHandler} />
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
