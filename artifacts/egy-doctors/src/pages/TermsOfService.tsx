import { Layout } from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsOfService() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16" dir={dir}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isRTL ? "شروط الخدمة" : "Terms of Service"}
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          {isRTL ? "تاريخ السريان: يُحدَّد لاحقاً" : "Effective Date: To be determined"}
        </p>

        <Section number="1" title={isRTL ? "القبول والموافقة" : "Acceptance of Terms"} isRTL={isRTL}>
          {isRTL
            ? "بوصولك إلى منصة إيجي دكتورز أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي من هذه الشروط، فيُرجى التوقف عن استخدام المنصة."
            : "By accessing or using the EGY Doctors platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, please stop using the platform."}
        </Section>

        <Section number="2" title={isRTL ? "وصف الخدمة" : "Description of Service"} isRTL={isRTL}>
          <p className="mb-4">
            {isRTL
              ? "إيجي دكتورز هي منصة دليل طبي رقمي تتيح للمرضى البحث عن الأطباء وحجز المواعيد، كما تتيح للأطباء إنشاء ملفاتهم الشخصية وإدارة مواعيدهم ونشر المحتوى الصحي. تشمل خدماتنا:"
              : "EGY Doctors is a digital medical directory platform that allows patients to search for doctors and book appointments, and allows doctors to create profiles, manage appointments, and publish health content. Our services include:"}
          </p>
          <ul className="space-y-2">
            {(isRTL ? [
              "دليل الأطباء وأدوات البحث وصفحات الملفات الشخصية.",
              "حجز المواعيد والتواصل بين المريض والطبيب.",
              "مجلة إيجي دكتورز لنشر المقالات والمحتوى الصحي.",
              "لوحات تحكم إدارة الممارسة للأطباء والمراكز الطبية.",
              "خدمات الاشتراك وإدارة الفواتير للأطباء.",
            ] : [
              "Doctor directory, search tools, and profile pages.",
              "Appointment booking and patient-doctor communication.",
              "EGY Doctors Magazine for publishing articles and health content.",
              "Practice management dashboards for doctors and medical centers.",
              "Subscription services and billing management for doctors.",
            ]).map((item, i) => (
              <BulletItem key={i} isRTL={isRTL}>{item}</BulletItem>
            ))}
          </ul>
        </Section>

        <Section number="3" title={isRTL ? "حسابات المستخدمين" : "User Accounts"} isRTL={isRTL}>
          <p className="mb-4">
            {isRTL
              ? "لاستخدام الميزات المحمية في المنصة، يجب عليك إنشاء حساب. أنت مسؤول عن:"
              : "To use protected features of the platform, you must create an account. You are responsible for:"}
          </p>
          <ul className="space-y-2">
            {(isRTL ? [
              "تقديم معلومات دقيقة وكاملة وحديثة أثناء التسجيل.",
              "الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وعدم مشاركتها.",
              "جميع الأنشطة التي تتم تحت حسابك.",
              "إبلاغنا فوراً بأي استخدام غير مصرح به لحسابك.",
            ] : [
              "Providing accurate, complete, and current information during registration.",
              "Maintaining the confidentiality of your login credentials and not sharing them.",
              "All activities that occur under your account.",
              "Notifying us immediately of any unauthorized use of your account.",
            ]).map((item, i) => (
              <BulletItem key={i} isRTL={isRTL}>{item}</BulletItem>
            ))}
          </ul>
        </Section>

        <Section number="4" title={isRTL ? "التسجيل كطبيب" : "Doctor Registration"} isRTL={isRTL}>
          {isRTL
            ? "يتعهد الأطباء المسجلون على المنصة بتقديم بيانات اعتماد مهنية صحيحة، بما في ذلك رقم عضوية نقابة الأطباء والتخصص والمؤهلات ذات الصلة. يحق لإيجي دكتورز التحقق من هذه المعلومات وتعليق أو حذف الحسابات التي تقدم معلومات مضللة أو احتيالية. لا تعمل إيجي دكتورز بوصفها مقدمة للخدمات الطبية ولا تتحمل أي مسؤولية عن الرعاية المقدمة من قِبل الأطباء المدرجين."
            : "Doctors registered on the platform undertake to provide valid professional credentials, including their Medical Syndicate membership number, specialty, and relevant qualifications. EGY Doctors reserves the right to verify this information and to suspend or remove accounts that provide misleading or fraudulent information. EGY Doctors does not act as a medical service provider and assumes no liability for care provided by listed doctors."}
        </Section>

        <Section number="5" title={isRTL ? "الاستخدام المقبول" : "Acceptable Use"} isRTL={isRTL}>
          <p className="mb-4">
            {isRTL ? "يُحظر عليك استخدام المنصة في:" : "You may not use the platform to:"}
          </p>
          <ul className="space-y-2">
            {(isRTL ? [
              "انتهاك أي قوانين أو لوائح معمول بها.",
              "نشر معلومات طبية كاذبة أو مضللة أو ضارة.",
              "التحرش بالمستخدمين الآخرين أو الإساءة إليهم أو التشهير بهم.",
              "انتهاك حقوق الملكية الفكرية لإيجي دكتورز أو أطراف ثالثة.",
              "محاولة الوصول غير المصرح به إلى أنظمتنا أو بيانات المستخدمين الآخرين.",
              "إرسال محتوى ترويجي أو إعلانات غير مرغوب فيها (سبام).",
            ] : [
              "Violate any applicable laws or regulations.",
              "Post false, misleading, or harmful medical information.",
              "Harass, abuse, or defame other users.",
              "Infringe the intellectual property rights of EGY Doctors or third parties.",
              "Attempt unauthorized access to our systems or other users' data.",
              "Send unsolicited promotional content or spam.",
            ]).map((item, i) => (
              <BulletItem key={i} isRTL={isRTL}>{item}</BulletItem>
            ))}
          </ul>
        </Section>

        <Section number="6" title={isRTL ? "الاشتراكات والمدفوعات" : "Subscriptions & Payments"} isRTL={isRTL}>
          {isRTL
            ? "قد تخضع بعض ميزات المنصة الموجهة للأطباء لرسوم اشتراك. تُعالَج المدفوعات عبر بوابات دفع آمنة تابعة لجهات خارجية. تُعدّ رسوم الاشتراك غير قابلة للاسترداد ما لم ينص القانون المعمول به على خلاف ذلك. تحتفظ إيجي دكتورز بالحق في تعديل أسعار الاشتراكات مع إشعار مسبق مناسب للمشتركين الحاليين."
            : "Certain platform features for doctors may be subject to subscription fees. Payments are processed through secure third-party payment gateways. Subscription fees are non-refundable unless otherwise required by applicable law. EGY Doctors reserves the right to modify subscription pricing with appropriate advance notice to existing subscribers."}
        </Section>

        <Section number="7" title={isRTL ? "إخلاء المسؤولية الطبية" : "Medical Disclaimer"} isRTL={isRTL}>
          {isRTL
            ? "المحتوى المتاح على منصة إيجي دكتورز، بما في ذلك الملفات الشخصية للأطباء والمقالات والنصائح الصحية، مقدَّم للأغراض المعلوماتية العامة فحسب، ولا يُعدّ بديلاً عن الاستشارة الطبية المتخصصة أو التشخيص أو العلاج. استشر دائماً طبيبك أو مقدم الرعاية الصحية المؤهل بشأن أي استفسار طبي."
            : "Content available on the EGY Doctors platform, including doctor profiles, articles, and health tips, is provided for general informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your doctor or a qualified healthcare provider regarding any medical questions."}
        </Section>

        <Section number="8" title={isRTL ? "حدود المسؤولية" : "Limitation of Liability"} isRTL={isRTL}>
          {isRTL
            ? "لن تكون إيجي دكتورز مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية ناجمة عن استخدامك للمنصة أو عدم قدرتك على استخدامها، أو عن أي محتوى منشور عليها. تقتصر مسؤوليتنا الإجمالية تجاهك في جميع الأحوال على المبلغ المدفوع مقابل الخدمة المعنية خلال الأشهر الثلاثة السابقة للمطالبة."
            : "EGY Doctors will not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the platform, or for any content posted on it. Our total aggregate liability to you in all circumstances shall not exceed the amount paid by you for the relevant service during the three months prior to the claim."}
        </Section>

        <Section number="9" title={isRTL ? "التغييرات على الشروط" : "Changes to Terms"} isRTL={isRTL}>
          {isRTL
            ? "تحتفظ إيجي دكتورز بالحق في تعديل شروط الخدمة هذه في أي وقت. سيتم إخطارك بالتغييرات الجوهرية عبر البريد الإلكتروني أو بإشعار واضح على المنصة. يُعدّ استمرارك في استخدام المنصة بعد نفاذ أي تغييرات موافقةً منك على الشروط المحدَّثة."
            : "EGY Doctors reserves the right to modify these Terms of Service at any time. You will be notified of material changes via email or a prominent notice on the platform. Your continued use of the platform after any changes take effect constitutes your acceptance of the updated terms."}
        </Section>

        <Section number="10" title={isRTL ? "تواصل معنا" : "Contact Us"} isRTL={isRTL}>
          {isRTL
            ? "إذا كانت لديك أسئلة أو استفسارات حول شروط الخدمة هذه، يرجى التواصل معنا عبر صفحة اتصل بنا."
            : "If you have questions or concerns about these Terms of Service, please contact us via our Contact page."}
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
