"use client";

import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "how-we-share", label: "How We Share Your Information" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "international-data", label: "International Data Transfers" },
  { id: "third-party", label: "Third-Party Links" },
  { id: "updates", label: "Updates to This Privacy Policy" },
  { id: "contact", label: "Contact Us" },
];

export function PrivacyPolicyClient() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    const container = document.getElementById("privacy-scroll-container");
    const observer = new IntersectionObserver(
      (entries) => {
        let maxVisibleRatio = 0;
        let mostVisibleSection = "";

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisibleRatio) {
            maxVisibleRatio = entry.intersectionRatio;
            mostVisibleSection = entry.target.id;
          }
        });

        if (mostVisibleSection) {
          setActiveSection(mostVisibleSection);
        }
      },
      {
        root: container,
        rootMargin: "-10% 0px -80% 0px", // triggers when section is in top half
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    const container = document.getElementById("privacy-scroll-container");
    if (element && container) {
      const offset = 0;
      const elementPosition = element.offsetTop;
      
      container.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
      });
      // Optionally update url without jump
      window.history.pushState(null, "", `#${id}`);
      setActiveSection(id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 px-6 lg:px-16 items-start relative h-full pb-8">
      
      {/* Left Navigation Menu */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col gap-6 font-medium">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => scrollTo(section.id, e)}
              className={`block pl-4 border-l-2 transition-all duration-200 text-sm ${
                isActive 
                  ? "border-[#a54a2a] text-[#a54a2a] font-bold drop-shadow-sm" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {section.label}
            </a>
          );
        })}
      </div>

      {/* Right Content Area */}
      <div id="privacy-scroll-container" className="flex-1 overflow-y-auto pr-4 scroll-smooth h-full pb-4">

        <div className="pl-8 text-gray-700 text-sm space-y-16 relative border-l-[2px] border-[#a54a2a] ml-[2px] pb-6">
          {/* Top dot */}
          <div className="absolute top-2 -left-[7px] w-3 h-3 rounded-full bg-[#a54a2a]"></div>
          {/* Bottom dot */}
          <div className="absolute bottom-0 -left-[7px] w-3 h-3 rounded-full bg-[#a54a2a]"></div>
          
          {/* 1. Information We Collect */}
          <section id="information-we-collect">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Information We Collect</h2>
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-base">1.1 Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-medium text-gray-900">Account Information:</span> Name, email address, phone number, business name, password.</li>
                <li><span className="font-medium text-gray-900">Billing Information:</span> Payment details when funding your Growdex wallet or paying for services.</li>
                <li><span className="font-medium text-gray-900">Business Information:</span> Ad account IDs, social media handles, business category, marketing goals.</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-base">1.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Device information (browser, device model, IP address)</li>
                <li>Usage logs (pages visited, actions performed on the platform)</li>
                <li>Cookies and tracking technologies</li>
                <li>System diagnostics for performance and security monitoring</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-base">1.3 Third-Party Platform Data</h3>
              <p className="text-gray-600 mb-3">When you connect advertising accounts (e.g., TikTok, Meta), we may receive:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ad performance metrics</li>
                <li>Audience insights</li>
                <li>Creative assets</li>
                <li>Campaign configuration details</li>
                <li>Spend and billing data</li>
                <li>OAuth access tokens (securely stored and encrypted)</li>
              </ul>
              <p className="text-gray-500 text-xs mt-4">We only access data you explicitly authorize.</p>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section id="how-we-use">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">How We Use Your Information</h2>
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-base">2.1 Provide and Improve Our Services</h3>
              <p className="text-gray-600 mb-3">We use your information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Enable ad creation, publishing, and campaign management</li>
                <li>Provide budgeting, wallet functionality, and billing</li>
                <li>Show analytics, insights, and performance reports</li>
                <li>Offer AI-driven recommendations and optimizations</li>
                <li>Maintain platform security and prevent fraud</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-base">2.2 Communication</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Product updates</li>
                <li>Account alerts</li>
                <li>Security notifications</li>
                <li>Marketing or promotional content (optional)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-base">2.3 Compliance</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Meet legal, regulatory, and API partner (TikTok/Meta) requirements</li>
                <li>Enforce terms and policies</li>
                <li>Respond to support requests</li>
              </ul>
            </div>
          </section>

          {/* 3. How We Share Your Information */}
          <section id="how-we-share">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">How We Share Your Information</h2>
            <p className="font-bold text-gray-900 mb-4">We do not sell your data.</p>
            <p className="text-gray-600 mb-3">We only share information with:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Advertising platforms (Meta, TikTok) to run your campaigns</li>
              <li>Payment processors to handle billing securely</li>
              <li>Cloud hosting providers (AWS, GCP, or equivalent)</li>
              <li>Analytics and error monitoring tools</li>
            </ul>
            <p className="font-bold text-gray-900">We will never share information with unauthorized third parties.</p>
          </section>

          {/* 4. Data Security */}
          <section id="data-security">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Data Security</h2>
            <p className="text-gray-600 mb-3">We use industry-standard security practices including:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Encryption (in transit and at rest)</li>
              <li>OAuth 2.0 secure authentication</li>
              <li>Regular system monitoring and audits</li>
              <li>Role-based access control</li>
              <li>Secure cloud infrastructure</li>
            </ul>
            <p className="text-gray-600">However, no system is 100% secure. We work continually to improve our safeguards.</p>
          </section>

          {/* 5. Data Retention */}
          <section id="data-retention">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Data Retention</h2>
            <p className="text-gray-600 mb-3">We keep your information only as long as necessary:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Account data: retained while your account is active</li>
              <li>Ad platform tokens: deleted immediately upon disconnection</li>
              <li>Usage logs: kept for system improvement and monitoring</li>
              <li>Legal/financial records: retained as required by law</li>
            </ul>
            <p className="text-gray-600">You can request deletion of your account and associated data at any time.</p>
          </section>

          {/* 6. Your Rights */}
          <section id="your-rights">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Your Rights</h2>
            <p className="text-gray-600 mb-3">Depending on your region, you may have rights to:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Access your data</li>
              <li>Update or correct your data</li>
              <li>Request deletion</li>
              <li>Export your data</li>
              <li>Withdraw consent for marketing</li>
              <li>Disconnect third-party ad accounts</li>
            </ul>
            <p className="text-gray-600">To exercise these rights, contact: <a href="mailto:privacy@growdex.ai" className="text-blue-600 hover:underline">privacy@growdex.ai</a></p>
          </section>

          {/* 7. Children's Privacy */}
          <section id="childrens-privacy">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Children's Privacy</h2>
            <p className="text-gray-600 mb-2">Growdex is not intended for children under 18.</p>
            <p className="text-gray-600">We do not knowingly collect data from minors.</p>
          </section>

          {/* 8. International Data Transfers */}
          <section id="international-data">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">International Data Transfers</h2>
            <p className="text-gray-600 mb-2">Your data may be stored or processed in regions outside your home country.</p>
            <p className="text-gray-600">We use secure, compliant data transfer mechanisms.</p>
          </section>

          {/* 9. Third-Party Links */}
          <section id="third-party">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Third-Party Links</h2>
            <p className="text-gray-600 mb-2">Our website or dashboards may contain links to external websites.</p>
            <p className="text-gray-600">We are not responsible for their privacy practices.</p>
          </section>

          {/* 10. Updates to This Privacy Policy */}
          <section id="updates">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Updates to This Privacy Policy</h2>
            <p className="text-gray-600 mb-2">We may update this policy occasionally.</p>
            <p className="text-gray-600">We will notify users of major changes via email or dashboard notifications.</p>
          </section>

          {/* 11. Contact Us */}
          <section id="contact">
            <h2 className="text-2xl font-gilroy-bold text-[#a54a2a] mb-6 drop-shadow-sm">Contact Us</h2>
            <p className="text-gray-600 mb-4">For questions, concerns, or data requests:</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="mb-2"><span className="font-semibold text-gray-900">Email:</span> <a href="mailto:privacy@growdex.ai" className="text-blue-600 hover:underline">privacy@growdex.ai</a></p>
              <p className="mb-2"><span className="font-semibold text-gray-900">Company:</span> Growdex Labs Ltd.</p>
              <p><span className="font-semibold text-gray-900">Address:</span> 40, Obeagu Street, Otuku Emene, Enugu State, Nigeria</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
