import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta">
      {/* Header */}
      <header className="container mx-auto px-4 md:px-12 py-4">
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
          <img
            src="/onboard/result.png"
            alt="OnboardTicket Logo"
            className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
            loading="eager"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF] text-center">
            
            <div className="mb-8">
              <XCircle className="w-16 h-16 text-yellow-500 mx-auto" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#3839C9] mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-lg text-[#637996] mb-6">
              Your PayPal payment was cancelled. No charges were made to your account.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-700 font-medium">
                Your booking has not been confirmed. You can try again with a different payment method.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/payment')}
                className="bg-[#3839C9] text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                Return to Payment
              </button>
              
              <div className="text-center">
                <button
                  onClick={() => navigate('/userform')}
                  className="text-[#3839C9] hover:text-blue-700 font-medium"
                >
                  Start New Booking
                </button>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => navigate('/contact')}
                  className="text-[#637996] hover:text-[#3839C9] font-medium"
                >
                  Need Help? Contact Support
                </button>
              </div>
            </div>
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
