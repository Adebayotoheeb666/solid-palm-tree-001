import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Plane, 
  Download, 
  Eye, 
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAuthenticatedFetch } from "../hooks/useAuth";
import { Booking } from "@shared/api";

export default function BookingHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "amount">("date");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await authenticatedFetch('/api/user/bookings');
      if (response.ok) {
        const data: Booking[] = await response.json();
        setBookings(data);
      } else {
        setError("Failed to load booking history");
      }
    } catch (err) {
      setError("An error occurred while loading your bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "expired":
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "expired":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredAndSortedBookings = bookings
    .filter(booking => {
      const matchesSearch = booking.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route.from.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.route.to.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "amount":
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E7E9FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3839C9] mx-auto mb-4"></div>
          <p className="text-[#637996]">Loading your booking history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta">
      {/* Header */}
      <header className="container mx-auto px-4 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#637996]" />
            </button>
            <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
              <img
                src="/onboard/result.png"
                alt="OnboardTicket Logo"
                className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
                loading="eager"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-2 bg-[#3839C9] text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              New Booking
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-8">
        {/* Page Header */}
        <div className="bg-white/60 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF] mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#3839C9] mb-4">
            Booking History
          </h1>
          <p className="text-lg text-[#637996]">
            View and manage all your flight reservations
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white/80 rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by PNR, destination, or city"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "status" | "amount")}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3839C9] focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredAndSortedBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredAndSortedBookings.map((booking) => (
              <div key={booking.id} className="bg-white/80 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {getStatusIcon(booking.status)}
                      <span className="font-bold text-xl text-[#20242A]">
                        PNR: {booking.pnr}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Route */}
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#637996]" />
                        <div>
                          <p className="font-semibold text-[#20242A]">
                            {booking.route.from.city} → {booking.route.to.city}
                          </p>
                          <p className="text-sm text-[#637996]">
                            {booking.route.from.code} → {booking.route.to.code}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#637996]" />
                        <div>
                          <p className="font-semibold text-[#20242A]">
                            {new Date(booking.route.departureDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-[#637996]">
                            Departure Date
                          </p>
                        </div>
                      </div>

                      {/* Passengers */}
                      <div className="flex items-center gap-3">
                        <Plane className="w-5 h-5 text-[#637996]" />
                        <div>
                          <p className="font-semibold text-[#20242A]">
                            {booking.passengers.length} Passenger{booking.passengers.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-[#637996]">
                            {booking.passengers[0]?.firstName} {booking.passengers[0]?.lastName}
                            {booking.passengers.length > 1 && ` +${booking.passengers.length - 1} more`}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <span className="text-lg font-bold text-[#637996]">$</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#20242A]">
                            {booking.totalAmount} {booking.currency}
                          </p>
                          <p className="text-sm text-[#637996]">
                            Total Amount
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[#637996]">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#3839C9] text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {booking.ticketUrl && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#20242A] rounded-lg hover:bg-gray-200 transition-colors">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Plane className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#20242A] mb-4">
              {searchTerm || statusFilter !== "all" ? "No bookings found" : "No bookings yet"}
            </h3>
            <p className="text-[#637996] mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start your travel journey by booking your first flight reservation"}
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <button
                onClick={() => navigate("/register")}
                className="bg-[#3839C9] text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Book Your First Flight
              </button>
            )}
          </div>
        )}
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
