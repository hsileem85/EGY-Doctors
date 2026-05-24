import { Link } from "wouter";
import { Stethoscope, Users, Calendar, Shield, Star, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutUs() {
  const { t, dir } = useLanguage();

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: dir === "rtl" ? "أطباء موثوقون" : "Verified Doctors",
      desc: dir === "rtl"
        ? "جميع الأطباء على المنصة يتم التحقق منهم. يمكنك قراءة التقييمات والاطلاع على الخبرات."
        : "Every doctor on our platform is verified. Read real patient reviews and check credentials before booking.",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: dir === "rtl" ? "حجز فوري" : "Instant Booking",
      desc: dir === "rtl"
        ? "احجز موعدك في ثوانٍ، لا حاجة للانتظار أو الاتصال الهاتفي."
        : "Book your appointment in seconds — no phone calls, no waiting lists.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: dir === "rtl" ? "شبكات تأمين" : "Insurance Networks",
      desc: dir === "rtl"
        ? "ابحث عن أطباء يقبلون التأمين الصحي الخاص بك."
        : "Find doctors who accept your health insurance. Filter by Cigna, AXA, MetLife, Bupa, and more.",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: dir === "rtl" ? "تغطية على مستوى مصر" : "Nationwide Coverage",
      desc: dir === "rtl"
        ? "من القاهرة إلى الإسكندرية، ابحث عن أفضل الأطباء في محافظتك ومنطقتك."
        : "From Cairo to Alexandria — search top doctors in your governorate and neighborhood.",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: dir === "rtl" ? "مجاني تماماً" : "Completely Free",
      desc: dir === "rtl"
        ? "الحجز مجاني 100% للمرضى. لا رسوم خفية، لا عمولات."
        : "Booking is 100% free for patients. No hidden fees, no commissions.",
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: dir === "rtl" ? "تقييمات صادقة" : "Honest Reviews",
      desc: dir === "rtl"
        ? "تقييمات من مرضى حقيقيين لمساعدتك في اتخاذ القرار الصحيح."
        : "Real patient reviews to help you make the right choice for your health.",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70"></div>
        <div className="relative container mx-auto px-4 py-12 lg:py-16 text-center">
          <Stethoscope className="h-10 w-10 text-white/80 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
            {dir === "rtl" ? "عن " : "About "}<span className="font-brand">{dir === "rtl" ? "إجي دكتورز" : "EGY Doctors"}</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {dir === "rtl"
              ? "نحن نبني الطريقة التي يجد بها المصريون ويحجزون الأطباء — بسيطة وشفافة ومجانية."
              : "We're building the way Egyptians find and book doctors — simple, transparent, and free."}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {dir === "rtl" ? "رسالتنا" : "Our Mission"}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {dir === "rtl"
                  ? "في EGY Doctors، نؤمن بأن الوصول إلى الرعاية الصحية الجيدة يجب أن يكون سهلاً. مهمتنا هي توصيل المرضى بأفضل الأطباء في مصر — بسرعة وموثوقية — دون أي تعقيد."
                  : "At EGY Doctors, we believe that access to quality healthcare should be effortless. Our mission is to connect patients with the best doctors in Egypt — quickly, reliably, and without any hassle."}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {dir === "rtl"
                  ? "سواء كنت تبحث عن أخصائي قلب في التجمع الخامس، أو طبيب أطفال في مصر الجديدة، أو جراح عظام في المعادي — نحن هنا لنساعدك في العثور على الطبيب المناسب والحجز فوراً."
                  : "Whether you're looking for a cardiologist in New Cairo, a pediatrician in Heliopolis, or an orthopedic surgeon in Maadi — we're here to help you find the right doctor and book instantly."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-gray-600">
                  {dir === "rtl" ? "طبيب موثق" : "Verified Doctors"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">12K+</div>
                <div className="text-sm text-gray-600">
                  {dir === "rtl" ? "حجز شهرياً" : "Monthly Bookings"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">5</div>
                <div className="text-sm text-gray-600">
                  {dir === "rtl" ? "محافظات" : "Governorates"}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">4.8</div>
                <div className="text-sm text-gray-600">
                  {dir === "rtl" ? "متوسط التقييم" : "Average Rating"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {dir === "rtl" ? <>لماذا <span className="font-brand">EGY Doctors</span>؟</> : <>Why <span className="font-brand">EGY Doctors</span>?</>}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {dir === "rtl"
                ? "نصمم كل ميزة لتجعل تجربة البحث عن الطبيب سلسة وآمنة."
                : "Every feature is designed to make your doctor search experience smooth and safe."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {dir === "rtl" ? "ابدأ رحلتك الصحية اليوم" : "Start Your Health Journey Today"}
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            {dir === "rtl"
              ? "ابحث عن طبيبك المفضل واحجز موعدك في دقائق."
              : "Find your preferred doctor and book an appointment in minutes."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8">
                {dir === "rtl" ? "البحث عن أطباء" : "Search Doctors"}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8">
                {dir === "rtl" ? "تسجيل كطبيب" : "Register as Doctor"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
