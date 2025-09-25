import React from "react";
import { Shield, Eye, Cookie, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy: React.FC = () => {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Personal information you provide when contacting us (name, email)",
        "Usage data and analytics to improve our website experience",
        "Cookies and similar technologies for website functionality",
        "Payment information when purchasing licenses (processed securely by Stripe)",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "To respond to your inquiries and provide customer support",
        "To process licensing transactions and deliver purchased content",
        "To send important updates about your purchases or account",
        "To improve our website and services based on usage patterns",
        "To comply with legal obligations and protect our rights",
      ],
    },
    {
      icon: Shield,
      title: "Information Sharing",
      content: [
        "We do not sell, trade, or rent your personal information to third parties",
        "We may share information with trusted service providers (Stripe, analytics)",
        "We may disclose information when required by law or to protect our rights",
        "Anonymous, aggregated data may be shared for research or marketing purposes",
      ],
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      content: [
        "We use essential cookies for website functionality and user experience",
        "Analytics cookies help us understand how visitors use our website",
        "You can control cookie preferences through your browser settings",
        "Some features may not work properly if certain cookies are disabled",
      ],
    },
  ];

  return (
    <div className="pt-16 lg:pt-20 min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-poppins">
            Privacy <span className="text-pink-400">Policy</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your personal information when you use our
            website and services.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Last updated: January 2024
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 font-poppins">
            Our Commitment to Your Privacy
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            At YoBaeXo, we respect your privacy and are committed to protecting
            your personal information. This Privacy Policy describes how we
            collect, use, disclose, and safeguard your information when you
            visit our website yobaexo.com and use our services.
          </p>
          <p className="text-gray-300 leading-relaxed">
            By using our website, you consent to the practices described in this
            Privacy Policy. If you do not agree with this policy, please do not
            use our services.
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="bg-gray-800 rounded-2xl p-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-poppins">
                    {section.title}
                  </h2>
                </div>

                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-300 leading-relaxed">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Data Security */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 font-poppins">
            Data <span className="text-cyan-400">Security</span>
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. These measures
            include:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-gray-300">
                SSL encryption for all data transmitted to and from our website
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-gray-300">
                Secure servers and databases with restricted access
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-gray-300">
                Regular security audits and updates to our systems
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-gray-300">
                Payment processing handled by PCI-compliant providers (Stripe)
              </p>
            </li>
          </ul>
          <p className="text-gray-400 text-sm">
            While we strive to protect your information, no method of
            transmission over the Internet or electronic storage is 100% secure.
            We cannot guarantee absolute security.
          </p>
        </div>

        {/* Your Rights */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 font-poppins">
            Your <span className="text-violet-400">Rights</span>
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Depending on your location, you may have certain rights regarding
            your personal information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Access & Portability
              </h3>
              <p className="text-gray-400 text-sm">
                You can request access to your personal information and receive
                a copy in a portable format.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Correction
              </h3>
              <p className="text-gray-400 text-sm">
                You can request that we correct any inaccurate or incomplete
                personal information.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Deletion
              </h3>
              <p className="text-gray-400 text-sm">
                You can request that we delete your personal information,
                subject to certain exceptions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Opt-out</h3>
              <p className="text-gray-400 text-sm">
                You can opt out of marketing communications at any time using
                unsubscribe links.
              </p>
            </div>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 font-poppins">
            Third-Party <span className="text-pink-400">Services</span>
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Our website integrates with various third-party services to provide
            functionality and improve user experience:
          </p>
          <div className="space-y-4">
            <div className="border-l-4 border-pink-400 pl-4">
              <h3 className="text-lg font-semibold text-white mb-2">Stripe</h3>
              <p className="text-gray-400 text-sm">
                Payment processing for licensing purchases. Stripe has its own
                privacy policy and security measures.
              </p>
            </div>
            <div className="border-l-4 border-cyan-400 pl-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Google Analytics
              </h3>
              <p className="text-gray-400 text-sm">
                Website analytics to understand visitor behavior. Data is
                anonymized and aggregated.
              </p>
            </div>
            <div className="border-l-4 border-violet-400 pl-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Social Media Platforms
              </h3>
              <p className="text-gray-400 text-sm">
                Embedded content from YouTube, Instagram, and other platforms
                may collect data according to their policies.
              </p>
            </div>
          </div>
        </div>

        {/* Updates to Policy */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 font-poppins">
            Policy <span className="text-cyan-400">Updates</span>
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. We will notify you of any material changes by:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-gray-300">
                Posting the updated policy on this page
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-gray-300">
                Updating the "Last updated" date at the top of this policy
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-gray-300">
                Sending email notifications for significant changes (if you've
                provided your email)
              </p>
            </li>
          </ul>
          <p className="text-gray-400 text-sm">
            Your continued use of our services after the effective date of the
            updated policy constitutes acceptance of the revised terms.
          </p>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-2xl p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mb-6">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 font-poppins">
              Questions About Privacy?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or how we
              handle your personal information, please don't hesitate to contact
              us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@yobaexo.com"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="mr-2 h-5 w-5" />
                info@yobaexo.com
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-semibold rounded-full hover:bg-cyan-400 hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
