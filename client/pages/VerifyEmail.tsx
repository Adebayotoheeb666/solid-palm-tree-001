import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmailToken(token);
  }, [token]);

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      setStatus("loading");
      setMessage("Verifying your email address...");

      const response = await fetch(
        `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`,
      );
      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        setEmail(data.email);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login?verified=true");
        }, 3000);
      } else {
        if (data.message.includes("expired")) {
          setStatus("expired");
          setMessage(
            "Your verification link has expired. Please request a new one.",
          );
        } else {
          setStatus("error");
          setMessage(data.message || "Email verification failed.");
        }
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setStatus("error");
      setMessage("Unable to verify email. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      // If we don't have email, redirect to registration
      navigate("/register");
      return;
    }

    try {
      setResending(true);

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          "A new verification email has been sent! Please check your inbox.",
        );
        setStatus("loading"); // Reset to loading state
      } else {
        setMessage(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setMessage("Unable to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-16 h-16 animate-spin text-[#3839C9]" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "error":
      case "expired":
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Mail className="w-16 h-16 text-[#3839C9]" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
      case "expired":
        return "text-red-600";
      default:
        return "text-[#3839C9]";
    }
  };

  return (
    <div className="min-h-screen bg-[#E7E9FF] font-jakarta">
      {/* Header */}
      <header className="container mx-auto px-4 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/onboard/result.png"
              alt="OnboardTicket Logo"
              className="h-14 md:h-24 w-auto max-w-[220px] md:max-w-[320px] object-contain cursor-pointer"
              loading="eager"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 py-8 md:py-16">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-[24px] p-8 md:p-12 shadow-xl border border-[#E7E9FF]">
            {/* Status Icon */}
            <div className="text-center mb-8">{getStatusIcon()}</div>

            {/* Title and Message */}
            <div className="text-center mb-8">
              <h1
                className={`text-3xl md:text-4xl font-extrabold mb-4 ${getStatusColor()}`}
              >
                {status === "loading" && "Verifying Email"}
                {status === "success" && "Email Verified!"}
                {status === "error" && "Verification Failed"}
                {status === "expired" && "Link Expired"}
              </h1>

              <p className="text-lg text-[#637996] mb-6 leading-relaxed">
                {message}
              </p>

              {email && status === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    <strong>Email verified:</strong> {email}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {status === "success" && (
                <div className="text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-[#3839C9] text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue to Sign In
                  </button>
                  <p className="text-sm text-[#637996] mt-2">
                    Redirecting automatically in 3 seconds...
                  </p>
                </div>
              )}

              {(status === "expired" || status === "error") && (
                <div className="space-y-3">
                  {email && (
                    <button
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="w-full bg-[#3839C9] text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          Resend Verification Email
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => navigate("/register")}
                    className="w-full bg-transparent border-2 border-[#3839C9] text-[#3839C9] font-bold py-4 px-6 rounded-lg hover:bg-[#3839C9] hover:text-white transition-colors"
                  >
                    Back to Registration
                  </button>
                </div>
              )}

              {status === "loading" && (
                <div className="text-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[#3839C9] hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#A2A2A2]">
                Need help? Contact our support team at{" "}
                <a
                  href="mailto:support@onboardticket.com"
                  className="text-[#3839C9] hover:underline"
                >
                  support@onboardticket.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
