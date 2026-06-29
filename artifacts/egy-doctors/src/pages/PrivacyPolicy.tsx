import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPolicy() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16" dir={dir}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          {isRTL ? "تاريخ السريان: يُحدَّد لاحقاً" : "Effective Date: To be determined"}
        </p>

        <Section
          number="1"
          title={isRTL ? "المقدمة" : "Introduction"}
          isRTL={isRTL}
        >
          {isRTL
            ? "مرحباً بكم في إيجي دكتورز. نحن ملتزمون بحماية خصوصية وأمان المعلومات الشخصية لمستخدمينا. توضح سياسة الخصوصية هذه كيفية جمعنا للمعلومات واستخدامها والإفصاح عنها وحمايتها عند زيارتك لموقعنا الإلكتروني واستخدامك لمنصتنا."
            : "Welcome to EGY Doctors. We are committed to protecting the privacy and security of our users' personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our platform."}
        </Section>

        <Section
          number="2"
          title={isRTL ? "المعلومات التي نجمعها" : "Information We Collect"}
          isRTL={isRTL}
        >
          <p className="mb-4">
            {isRTL
              ? "نجمع المعلومات التي تعرّفك عليك أو ترتبط بك أو تصفك أو يمكن ربطها بك بشكل معقول:"
              : "We collect information that identifies, relates to, describes, or could reasonably be linked with you:"}
          </p>
          <ul className="space-y-3">
            <BulletItem isRTL={isRTL}>
              <strong>{isRTL ? "معلومات الحساب (الأطباء):" : "Account Information (Doctors):"}</strong>{" "}
              {isRTL
                ? "الاسم، المسمى المهني، رقم عضوية النقابة الطبية، التخصص، البريد الإلكتروني، رقم الهاتف، وموقع الممارسة."
                : "Name, professional title, Medical Syndicate Membership Number, specialty, email address, phone number, and practice location."}
            </BulletItem>
            <BulletItem isRTL={isRTL}>
              <strong>{isRTL ? "معلومات الحساب (المرضى/المستخدمون):" : "Account Information (Patients/Users):"}</strong>{" "}
              {isRTL
                ? "الاسم، البريد الإلكتروني، رقم الهاتف، وتفضيلات التواصل (مثل واتساب، البريد الإلكتروني)."
                : "Name, email address, phone number, and communication preferences (e.g., WhatsApp, Email)."}
            </BulletItem>
            <BulletItem isRTL={isRTL}>
              <strong>{isRTL ? "بيانات التفاعل:" : "Interaction Data:"}</strong>{" "}
              {isRTL
                ? "معلومات حول تفاعلاتك على المنصة، بما في ذلك الأطباء الذين تتابعهم، والمقاطع/المقالات التي تعجبك، والتعليقات التي تنشرها، والمحتوى الذي تشاركه."
                : "Information regarding your interactions on the platform, including doctors you follow, videos/articles you like, comments you post, and content you share."}
            </BulletItem>
            <BulletItem isRTL={isRTL}>
              <strong>{isRTL ? "المعلومات المالية:" : "Financial Information:"}</strong>{" "}
              {isRTL
                ? "بالنسبة للأطباء الذين يستخدمون خدمات الاشتراك، تُعالَج تفاصيل الدفع مباشرةً عبر بوابة الدفع الآمنة التابعة لجهة خارجية (مثل Paymob). لا تقوم إيجي دكتورز بتخزين أرقام بطاقات الائتمان الكاملة على خوادمنا."
                : "For doctors utilizing our subscription services, payment details are processed directly by our secure third-party payment gateway (e.g., Paymob). EGY Doctors does not directly store full credit card numbers on our servers."}
            </BulletItem>
          </ul>
        </Section>

        <Section
          number="3"
          title={isRTL ? "كيف نستخدم معلوماتك" : "How We Use Your Information"}
          isRTL={isRTL}
        >
          <p className="mb-4">
            {isRTL ? "نستخدم المعلومات التي تم جمعها للأغراض التالية:" : "We use the collected information for the following purposes:"}
          </p>
          <ul className="space-y-2">
            {(isRTL ? [
              "إنشاء حسابك وإدارته والمصادقة عليه.",
              "تشغيل مجلة إيجي دكتورز وملفات تعريف الأطباء، بما في ذلك نشر مقاطع الفيديو والمقالات والنصائح السريعة.",
              "إرسال الإشعارات التلقائية (عبر البريد الإلكتروني، الرسائل القصيرة، أو واتساب) عند نشر طبيب متابَع لمحتوى جديد.",
              "معالجة مدفوعات الاشتراك، وتطبيق القسائم الترويجية، وإدارة الفترات التجريبية المجانية للأطباء.",
              "تحسين أداء المنصة وتحليل تفاعل المستخدمين وتعزيز تجربة المستخدم الشاملة.",
            ] : [
              "To create, manage, and authenticate your account.",
              "To operate the EGY Doctors Magazine and Doctor Profiles, including publishing videos, articles, and quick tips.",
              "To send automated notifications (via Email, SMS, or WhatsApp) when a followed doctor publishes new content.",
              "To process subscription payments, apply promotional vouchers, and manage free trials for doctors.",
              "To improve platform performance, analyze user engagement, and enhance the overall user experience.",
            ]).map((item, i) => (
              <BulletItem key={i} isRTL={isRTL}>{item}</BulletItem>
            ))}
          </ul>
        </Section>

        <Section
          number="4"
          title={isRTL ? "مشاركة معلوماتك" : "Sharing Your Information"}
          isRTL={isRTL}
        >
          <p className="mb-4">
            {isRTL
              ? "نحن لا نبيع معلوماتك الشخصية. قد نشارك بياناتك في الحالات التالية:"
              : "We do not sell your personal information. We may share your data in the following circumstances:"}
          </p>
          <ul className="space-y-3">
            <BulletItem isRTL={isRTL}>
              <strong>{isRTL ? "الملفات الشخصية العامة:" : "Public Profiles:"}</strong>{" "}
              {isRTL
                ? "المعلومات التي يختار الأطباء نشرها (مقاطع الفيديو، المقالات، بيانات النقابة) وتفاعلات المرضى (التعليقات العامة) مرئية لمستخدمين آخرين."
                : "Information doctors choose to publish (videos, articles, syndicate credentials) and patient interactions (public comments) are visible to other users."}
            </BulletItem>
            <BulletItem isRTL={isRTL}>
              <strong>{isRTL ? "مزودو الخدمات:" : "Service Providers:"}</strong>{" "}
              {isRTL
                ? "نشارك البيانات الضرورية مع أطراف ثالثة موثوقة تساعد في تشغيل منصتنا، مثل معالجي المدفوعات وخدمات تسليم الإشعارات."
                : "We share necessary data with trusted third parties who assist in operating our platform, such as our payment processors and notification delivery services."}
            </BulletItem>
            <BulletItem isRTL={isRTL}>
              <strong>{isRTL ? "الامتثال القانوني:" : "Legal Compliance:"}</strong>{" "}
              {isRTL
                ? "قد نكشف عن المعلومات إذا كان ذلك مطلوباً بموجب القانون أو أمر قضائي أو إجراءات قانونية أخرى، أو لحماية حقوق وسلامة إيجي دكتورز ومستخدمينا أو غيرهم."
                : "We may disclose information if required by law, subpoena, or other legal processes, or to protect the rights and safety of EGY Doctors, our users, or others."}
            </BulletItem>
          </ul>
        </Section>

        <Section
          number="5"
          title={isRTL ? "أمان البيانات" : "Data Security"}
          isRTL={isRTL}
        >
          {isRTL
            ? "نطبق تدابير أمنية إدارية وتقنية ومادية قوية وفق المعايير الصناعية لحماية معلوماتك الشخصية. ومع ذلك، لا يمكن ضمان أن أي إرسال إلكتروني عبر الإنترنت أو تقنية تخزين المعلومات تكون آمنة بنسبة 100٪."
            : "We implement robust, industry-standard administrative, technical, and physical security measures to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure."}
        </Section>

        <Section
          number="6"
          title={isRTL ? "حقوقك" : "Your Rights"}
          isRTL={isRTL}
        >
          {isRTL
            ? "اعتماداً على ولايتك القضائية، قد يكون لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو تحديثها أو طلب حذفها. يمكن للمستخدمين إدارة تفضيلات الإشعارات وتفاصيل الملف الشخصي مباشرةً من لوحات التحكم الخاصة بهم."
            : "Depending on your jurisdiction, you may have the right to access, correct, update, or request the deletion of your personal data. Users can manage their notification preferences and profile details directly within their account dashboards."}
        </Section>

        <Section
          number="7"
          title={isRTL ? "تواصل معنا" : "Contact Us"}
          isRTL={isRTL}
        >
          {isRTL
            ? "إذا كانت لديك أسئلة أو تعليقات حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر صفحة اتصل بنا."
            : "If you have questions or comments about this Privacy Policy, please contact us via our Contact page."}
        </Section>
      </div>
    </Layout>
  );
}

function Section({
  number,
  title,
  children,
  isRTL,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  isRTL: boolean;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        {isRTL ? `${title} .${number}` : `${number}. ${title}`}
      </h2>
      <div className="text-gray-600 leading-relaxed text-[15px]">{children}</div>
    </section>
  );
}

function BulletItem({ children, isRTL }: { children: React.ReactNode; isRTL: boolean }) {
  return (
    <li className={`flex gap-2 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D4A853] flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
