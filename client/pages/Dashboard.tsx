import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Calendar, 
  MapPin, 
  Plane, 
  Settings, 
  LogOut, 
  Download,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAuthenticatedFetch } from "../hooks/useAuth";
import { Booking, UserDashboardData } from "@shared/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await authenticatedFetch('/api/user/dashboard');
      if (response.ok) {
        const data: UserDashboardData = await response.json();
        setDashboardData(data);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      setError("An error occurred while loading your dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E7E9FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3839C9] mx-auto mb-4"></div>
          <p className="text-[#637996]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta">
      {/* Header */}
      <header className="container mx-auto px-4 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
            <img
              src="/onboard/result.png"
              alt="OnboardTicket Logo"
              className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
              loading="eager"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-2 bg-[#3839C9] text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              New Booking
            </button>
            <button
              onClick={handleLogout}
              className="px-8 py-2 text-brand-text-primary font-bold text-lg hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-8">
        {/* Welcome Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF] mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3839C9] mb-4">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-lg text-[#637996] mb-6">
                Manage your bookings and account from your dashboard
              </p>
            </div>
            <div className="bg-gradient-to-r from-[#3839C9] to-[#505BFB] text-white p-6 rounded-2xl">
              <User className="w-12 h-12 mb-2" />
              <p className="text-sm opacity-90">Account Status</p>
              <p className="font-bold">Verified</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#637996] text-sm font-semibold">Total Bookings</p>
                <p className="text-2xl font-bold text-[#20242A]">
                  {dashboardData?.totalBookings || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-[#3839C9]" />
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#637996] text-sm font-semibold">Upcoming Trips</p>
                <p className="text-2xl font-bold text-[#20242A]">
                  {dashboardData?.upcomingTrips?.length || 0}
                </p>
              </div>
              <Plane className="w-8 h-8 text-[#3839C9]" />
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#637996] text-sm font-semibold">Quick Actions</p>
                <button 
                  onClick={() => navigate("/register")}
                  className="text-[#3839C9] font-semibold hover:text-blue-700"
                >
                  Book New Flight
                </button>
              </div>
              <Settings className="w-8 h-8 text-[#3839C9]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white/80 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#20242A]">Recent Bookings</h2>
              <button 
                onClick={() => navigate("/booking-history")}
                className="text-[#3839C9] font-semibold hover:text-blue-700"
              >
                View All
              </button>
            </div>

            {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="font-semibold text-[#20242A]">
                          PNR: {booking.pnr}
                        </span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-[#637996]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.route.from.code} → {booking.route.to.code}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.route.departureDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-[#20242A]">
                        {booking.totalAmount} {booking.currency}
                      </span>
                      {booking.ticketUrl && (
                        <button className="flex items-center gap-1 text-[#3839C9] hover:text-blue-700 text-sm">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[#637996] mb-4">No bookings yet</p>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#3839C9] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book Your First Flight
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Trips */}
          <div className="bg-white/80 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#20242A] mb-6">Upcoming Trips</h2>
            
            {dashboardData?.upcomingTrips && dashboardData.upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingTrips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="gradient-box rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">PNR: {trip.pnr}</span>
                      <Plane className="w-5 h-5" />
                    </div>
                    
                    <div className="text-lg font-semibold mb-1">
                      {trip.route.from.city} → {trip.route.to.city}
                    </div>
                    
                    <div className="text-sm opacity-90">
                      Departure: {new Date(trip.route.departureDate).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm">
                        {trip.passengers.length} passenger{trip.passengers.length > 1 ? 's' : ''}
                      </span>
                      {trip.ticketUrl && (
                        <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors">
                          View Ticket
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[#637996] mb-4">No upcoming trips</p>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#3839C9] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Plan Your Next Trip
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/60 backdrop-blur-md rounded-[24px] p-8 shadow-xl border border-[#E7E9FF]">
          <h2 className="text-2xl font-bold text-[#20242A] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-3 bg-[#3839C9] text-white p-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plane className="w-6 h-6" />
              <span className="font-semibold">Book New Flight</span>
            </button>
            
            <button
              onClick={() => navigate("/booking-history")}
              className="flex items-center gap-3 bg-gray-100 text-[#20242A] p-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Calendar className="w-6 h-6" />
              <span className="font-semibold">View All Bookings</span>
            </button>
            
            <button
              onClick={() => navigate("/support-tickets")}
              className="flex items-center gap-3 bg-gray-100 text-[#20242A] p-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="font-semibold">Support Tickets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 px-4 sm:px-8 lg:px-36">
        <div className="bg-ticket-footer rounded-t-lg p-8 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {/* Logo and Copyright */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-start">
              <img
                src="/onboard/logos-01.png"
                alt="OnboardTicket Footer Logo"
                className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
                loading="lazy"
                onClick={() => navigate("/")}
              />
              <hr className="border-black w-32 sm:w-40 md:w-72" />
              <h4 className="font-semibold text-black text-xs sm:text-sm md:text-base">
                Onboardticket.com
              </h4>
              <p className="text-[10px] sm:text-xs font-semibold text-[#303850] opacity-50">
                © 2025 — Copyright
              </p>
            </div>
            {/* About */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center">
              <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">About</h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-[#A2A2A2]">
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/about")}>Who We are ?</li>
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/privacy-policy")}>Privacy Policy</li>
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/terms-conditions")}>Terms & Conditions</li>
              </ul>
            </div>
            {/* Get Help */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center">
              <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">Get Help</h4>
              <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm font-semibold text-[#A2A2A2]">
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/faq")}>FAQs</li>
                <li className="cursor-pointer hover:text-[#3839C9]" onClick={() => navigate("/contact")}>Contact Support 24/7</li>
              </ul>
            </div>
            {/* Follow Us */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center justify-center">
              <h4 className="text-base md:text-lg font-bold text-[#0D69F2]">Follow US</h4>
              <div className="space-y-1 md:space-y-2">
                <h5 className="text-base md:text-lg font-bold text-[#0D69F2]">Stay in touch</h5>
                <p className="text-xs sm:text-sm font-semibold text-[#A2A2A2]">Blog</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
