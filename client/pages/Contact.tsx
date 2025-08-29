import { useState } from "react";
import { MessageCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContactMenu from "./ContactMenu";
import MobileNav from "../components/MobileNav";
import { useToast } from "../hooks/use-toast";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Please fill out all fields" });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit message");
      }
      toast({ title: "Message sent", description: "We’ll get back to you shortly." });
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast({ title: "Could not send message", description: err?.message || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookNow = () => {
    navigate("/userform/route");
  };

  return (
    <div className="min-h-screen bg-[#F4F4FF] font-plus-jakarta">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-6 flex justify-between items-center">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/onboard/result.png"
            alt="OnboardTicket Logo"
            className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[220px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[360px] object-contain drop-shadow-sm cursor-pointer"
            loading="eager"
            onClick={() => navigate("/")}
          />
        </div>
        <nav className="hidden lg:flex items-center gap-4">
          <button
            className="px-4 sm:px-8 py-2 sm:py-3 text-ob-dark font-bold text-base sm:text-lg hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => navigate("/contact")}
          >
            Get Support
          </button>
          <button
            className="px-4 sm:px-8 py-2 sm:py-3 text-ob-dark font-semibold text-base sm:text-lg hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => navigate("/userform")}
          >
            Book now
          </button>
        </nav>
        <MobileNav className="lg:hidden" handleBookNow={handleBookNow} />
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ob-primary mb-6 leading-tight">
              24/7 human support
            </h1>
            <p className="text-xl lg:text-2xl font-bold text-[#637996] mb-6">
              Responses within 30 minutes, on average
            </p>
            <p className="text-lg lg:text-xl font-normal text-[#637996] leading-relaxed">
              Have a question? Need help? Reach out to our team now for fast,
              friendly support or check out our FAQs for more information.
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src="/onboard/message.png"
              alt="Support illustration"
              className="w-[200px] sm:w-[250px] lg:w-[298px] h-auto "
            />
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-12">
        <div className="flex flex-col sm:flex-row gap-6 max-w-4xl mx-auto">
          {/* Contact Support */}
          <div className="flex-1 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[linear-gradient(90deg,_rgb(172,178,241)_0%,_rgb(235,215,237)_100%)] flex flex-col sm:flex-row items-center justify-center sm:justify-start min-h-[140px] sm:min-h-[120px]">
            <img
              src="/onboard/contact.png"
              alt="Contact Support"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-3 sm:mb-0"
            />
            <div className="relative z-10 sm:ml-6 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black">
                Contact Support
              </h3>
            </div>
          </div>

          {/* FAQs */}
          <div className="flex-1 rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-[linear-gradient(90deg,_rgb(175,181,245)_0%,_rgb(204,233,220)_100%)] flex flex-col sm:flex-row items-center justify-center sm:justify-start min-h-[140px] sm:min-h-[120px]">
            <img
              src="/onboard/faq.png"
              alt="FAQs"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-3 sm:mb-0"
            />
            <div className="relative z-10 sm:ml-6 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-black">
                FAQs
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-36 py-12 lg:py-20">
        <section>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ob-primary mb-6 leading-tight">
              Tell us how we can help you
            </h2>
            <p className="text-lg lg:text-xl font-normal text-[#637996] opacity-76 mb-12">
              Fill out the form below and we'll get back to you within 30
              minutes, on average.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full px-8 py-6 rounded-3xl border-none bg-white text-[#637996] font-semibold text-xl placeholder:text-[#637996] placeholder:opacity-48 focus:outline-none focus:ring-2 focus:ring-[#505BFB] shadow-sm"
                />
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full px-8 py-6 rounded-3xl border-none bg-white text-[#637996] font-semibold text-xl placeholder:text-[#637996] placeholder:opacity-48 focus:outline-none focus:ring-2 focus:ring-[#505BFB] shadow-sm"
                />
              </div>

              {/* Message Field */}
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we Help You ?"
                  rows={8}
                  className="w-full px-8 py-6 rounded-3xl border-none bg-white text-[#637996] font-semibold text-xl placeholder:text-[#637996] placeholder:opacity-44 focus:outline-none focus:ring-2 focus:ring-[#505BFB] shadow-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-12 py-4 bg-[#001AFF] text-white font-bold text-xl lg:text-2xl rounded-3xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Submit Message"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 px-4 sm:px-8 lg:px-36">
        <div className="bg-ticket-footer rounded-t-lg p-8 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {/* Logo and Copyright */}
            <div className="space-y-4">
              <div>
                <img
                  src="/onboard/result.png"
                  alt="OnboardTicket Logo"
                  className="h-24 sm:h-28 md:h-32 w-auto max-w-[400px] sm:max-w-[480px] md:max-w-[560px] object-contain mb-4 cursor-pointer"
                  onClick={() => navigate("/")}
                />
                <hr className="border-white mb-4" />
                <div className="text-base font-semibold text-[#3150DA]">
                  Onboardticket.com
                </div>
                <div className="text-xs opacity-80 mt-2 text-black">
                  © 2025 — Copyright
                </div>
              </div>
              <p className="text-xs opacity-80 leading-relaxed text-black">
                OnboardTicket is committed to upholding the highest standards in
                compliance with international civil aviation regulations and
                ethical booking practices. This includes, but is not limited to,
                strict avoidance of misuse of booking classes, fraudulent
                activities, duplicate, speculative, or fictitious reservations.
                Users who engage in repeated cancellations without legitimate
                intent will be subject to monitoring, and may face usage
                restrictions or permanent bans from our platform.
              </p>
            </div>
            {/* About */}
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-[#3150DA]">
                About
              </h4>
              <ul className="space-y-3 text-sm sm:text-base">
                <li
                  className="text-black cursor-pointer hover:text-[#3839C9] transition-colors duration-200 font-medium"
                  onClick={() => navigate("/about")}
                >
                  Who We are ?
                </li>
                <li
                  className="text-black cursor-pointer hover:text-[#3839C9] transition-colors duration-200 font-medium"
                  onClick={() => navigate("/privacy-policy")}
                >
                  Privacy Policy
                </li>
                <li
                  className="text-black cursor-pointer hover:text-[#3839C9] transition-colors duration-200 font-medium"
                  onClick={() => navigate("/terms-conditions")}
                >
                  Terms & Conditions
                </li>
              </ul>
            </div>
            {/* Get Help */}
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-[#3150DA]">
                Get Help
              </h4>
              <ul className="space-y-3 text-sm sm:text-base">
                <li
                  className="text-black cursor-pointer hover:text-[#3839C9] transition-colors duration-200 font-medium"
                  onClick={() => navigate("/faq")}
                >
                  FAQs
                </li>
                <li
                  className="text-black cursor-pointer hover:text-[#3839C9] transition-colors duration-200 font-medium"
                  onClick={() => navigate("/payment")}
                >
                  Payment
                </li>
                <li
                  className="text-black cursor-pointer hover:text-[#3839C9] transition-colors duration-200 font-medium"
                  onClick={() => navigate("/contact")}
                >
                  Contact Support 24/7
                </li>
              </ul>
            </div>
            {/* Follow Us */}
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-[#3150DA]">
                Follow US
              </h4>
              <div className="space-y-2">
                <h5 className="text-lg sm:text-xl font-bold text-[#3150DA]">
                  Stay in touch
                </h5>
                <p className="text-sm sm:text-base text-black cursor-pointer hover:text-[#3839C9] transition-colors duration-200 font-medium">
                  Blog
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
