import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAuthenticatedFetch } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const { success: showSuccess, error: showError } = useNotifications();
  
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);

  useEffect(() => {
    const capturePayPalPayment = async () => {
      const orderId = searchParams.get('token');
      const payerId = searchParams.get('PayerID');

      if (!orderId || !payerId) {
        setError("Missing payment information");
        setProcessing(false);
        return;
      }

      try {
        // Capture the PayPal payment
        const captureResponse = await authenticatedFetch('/api/payments/paypal/capture', {
          method: 'POST',
          body: JSON.stringify({ orderId, payerId }),
        });

        if (!captureResponse.ok) {
          throw new Error('Failed to capture PayPal payment');
        }

        const captureResult = await captureResponse.json();

        if (captureResult.success) {
          // Process the payment in our system
          const paymentResponse = await authenticatedFetch('/api/payments', {
            method: 'POST',
            body: JSON.stringify({
              bookingId: searchParams.get('bookingId') || 'unknown',
              paymentMethod: 'paypal',
              paymentDetails: {
                paypalOrderId: orderId,
                paypalPayerId: payerId
              }
            }),
          });

          if (paymentResponse.ok) {
            setPaymentComplete(true);
            showSuccess("Payment successful!", "Your booking has been confirmed");
            
            // Clear stored data
            localStorage.removeItem('selectedRoute');
            localStorage.removeItem('passengerData');
            
            // Redirect after short delay
            setTimeout(() => {
              navigate('/userform/thankyou');
            }, 3000);
          } else {
            throw new Error('Failed to process payment in our system');
          }
        } else {
          throw new Error('PayPal payment capture failed');
        }
      } catch (err) {
        console.error('Payment capture error:', err);
        setError('Failed to complete payment. Please contact support.');
        showError("Payment Error", "There was an issue processing your payment");
      } finally {
        setProcessing(false);
      }
    };

    capturePayPalPayment();
  }, [searchParams, authenticatedFetch, navigate, showSuccess, showError]);

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
            
            {processing && (
              <>
                <div className="mb-8">
                  <Loader className="w-16 h-16 text-[#3839C9] mx-auto animate-spin" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#3839C9] mb-4">
                  Processing Payment
                </h1>
                <p className="text-lg text-[#637996] mb-6">
                  Please wait while we confirm your PayPal payment...
                </p>
              </>
            )}

            {!processing && paymentComplete && (
              <>
                <div className="mb-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-green-600 mb-4">
                  Payment Successful!
                </h1>
                <p className="text-lg text-[#637996] mb-6">
                  Your PayPal payment has been processed successfully. Your booking is confirmed!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-700 font-medium">
                    You will receive a confirmation email shortly with your ticket details.
                  </p>
                </div>
                <p className="text-sm text-[#637996]">
                  Redirecting to confirmation page...
                </p>
              </>
            )}

            {!processing && error && (
              <>
                <div className="mb-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-red-500 text-2xl">⚠</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-4">
                  Payment Error
                </h1>
                <p className="text-lg text-[#637996] mb-6">
                  {error}
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/payment')}
                    className="bg-[#3839C9] text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="block mx-auto text-[#3839C9] hover:text-blue-700 font-medium"
                  >
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
