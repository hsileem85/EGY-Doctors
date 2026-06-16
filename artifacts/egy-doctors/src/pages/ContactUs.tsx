import { useState } from "react";
import { Link } from "wouter";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactUs() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";

  const [formState, setFormState] = useState<"idle" | "submitting" | "sent">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setFormState("submitting");
    setTimeout(() => {
      setFormState("sent");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      label: isRTL ? "الهاتف" : "Phone",
      value: "+20 2 1234 5678",
      sub: isRTL ? "متاح من الأحد إلى الخميس" : "Available Sun–Thu",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: isRTL ? "البريد الإلكتروني" : "Email",
      value: "support@egydoctors.com",
      sub: isRTL ? "نرد خلال 24 ساعة" : "We reply within 24 hours",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: isRTL ? "العنوان" : "Address",
      value: isRTL
        ? "١٥ شارع التسعين، التجمع الخامس، القاهرة"
        : "15 Teseen St, New Cairo, Cairo",
      sub: isRTL ? "مصر" : "Egypt",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: isRTL ? "ساعات العمل" : "Working Hours",
      value: isRTL ? "٩:٠٠ ص – ٦:٠٠ م" : "9:00 AM – 6:00 PM",
      sub: isRTL ? "الأحد – الخميس" : "Sunday – Thursday",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Back + Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isRTL ? "الرجوع" : "Back"}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isRTL ? "تواصل معنا" : "Contact Us"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isRTL
                ? "نحن هنا للإجابة على استفساراتك ومساعدتك في حجز موعدك"
                : "We're here to answer your questions and help you book your appointment"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {contactInfo.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-3">
                  {item.icon}
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
              </div>
            ))}

            {/* WhatsApp shortcut */}
            <a
              href="https://wa.me/201234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white rounded-xl p-5 flex items-center gap-3 hover:bg-[#128C7E] transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">
                  {isRTL ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
                </p>
                <p className="text-xs text-white/80">
                  {isRTL ? "رد سريع خلال ساعات" : "Quick reply during hours"}
                </p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:p-8">
              {formState === "sent" ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {isRTL ? "تم الإرسال بنجاح!" : "Message Sent!"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isRTL
                      ? "شكراً على تواصلك. سنعود إليك في أقرب وقت."
                      : "Thank you for reaching out. We'll get back to you shortly."}
                  </p>
                  <Button onClick={() => setFormState("idle")} variant="outline">
                    {isRTL ? "إرسال رسالة أخرى" : "Send Another Message"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {isRTL ? "أرسل لنا رسالة" : "Send us a Message"}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {isRTL ? "الاسم" : "Name"}
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isRTL ? "محمد أحمد" : "John Smith"}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {isRTL ? "البريد الإلكتروني" : "Email"}
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isRTL ? "name@example.com" : "name@example.com"}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{isRTL ? "رقم الهاتف" : "Phone"}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={isRTL ? "+20 1xx xxx xxxx" : "+20 1xx xxx xxxx"}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{isRTL ? "الموضوع" : "Subject"}</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={
                          isRTL ? "استفسار عن حجز" : "Booking inquiry"
                        }
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {isRTL ? "الرسالة" : "Message"}
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        isRTL
                          ? "اكتب رسالتك هنا..."
                          : "Write your message here..."
                      }
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="w-full sm:w-auto bg-[#0F172A] hover:bg-[#1E293B] text-white h-11 px-8"
                  >
                    {formState === "submitting" ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isRTL ? "جاري الإرسال..." : "Sending..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {isRTL ? "إرسال الرسالة" : "Send Message"}
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-12 bg-[#0F172A] rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            {isRTL ? "هل تحتاج إلى مساعدة سريعة؟" : "Need Quick Help?"}
          </h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">
            {isRTL
              ? "تصفح الأسئلة الشائعة للحصول على إجابات فورية حول الحجز والتسجيل."
              : "Browse our FAQs for instant answers about booking and registration."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-[#10B981] text-[#0F172A] hover:bg-[#059669] font-semibold px-8"
              >
                {isRTL ? "البحث عن أطباء" : "Search Doctors"}
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8"
              >
                {isRTL ? "تسجيل كطبيب" : "Register as Doctor"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
