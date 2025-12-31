"use client";

import { type JSX, useState, useEffect, useRef } from "react";
import { PanelLayout } from "../../components/panel-layout";
import { SettingsSidebar } from "../../components/settings-sidebar";
import { SettingsHeader } from "../components/settings-header";
import { DashboardHeader } from "../../components/dashboard-header";

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: (
      <div className="space-y-6">
        {/* Section 1.1 */}
        <div>
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
            1.1 Information You Provide
          </h3>
          <ul className="space-y-2">
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                Account Information: Name, email address, phone number, business
                name, password, and billing information.
              </span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                Billing Information: Payment details when funding your Growdex
                wallet or paying for services.
              </span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                Business Information: Ad account IDs, social media handles,
                business category, marketing goals.
              </span>
            </li>
          </ul>
        </div>

        {/* Section 1.2 */}
        <div>
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
            1.2 Information Collected Automatically
          </h3>
          <ul className="space-y-2">
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                Device information: Device type, browser type, IP address.
              </span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                Usage logs: Pages visited, sections performed on the platform.
              </span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                Cookies and tracking technologies: Store user preferences and
                performance monitoring.
              </span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                System diagnostics: For performance and security monitoring.
              </span>
            </li>
          </ul>
        </div>

        {/* Section 1.3 */}
        <div>
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
            1.3 Third-Party Platform Data
          </h3>
          <ul className="space-y-2">
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>
                This data is collected only with explicit user consent.
              </span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>Ad performance metrics.</span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>Audience insights.</span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>Creative assets.</span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>Spend and billing data.</span>
            </li>
            <li className="text-xs md:text-sm text-gray-700 flex items-start">
              <span className="mr-3 text-gray-400">•</span>
              <span>OAuth access tokens (securely stored and encrypted).</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: (
      <div>
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
          2.1 Provide and Improve Our Services
        </h3>
        <ul className="space-y-2">
          <li className="text-xs md:text-sm text-gray-700 flex items-start">
            <span className="mr-3 text-gray-400">•</span>
            <span>We use your information to:</span>
          </li>
          <li className="text-xs md:text-sm text-gray-700 flex items-start">
            <span className="mr-3 text-gray-400">•</span>
            <span>
              Enable ad creation, publishing, and campaign management.
            </span>
          </li>
          <li className="text-xs md:text-sm text-gray-700 flex items-start">
            <span className="mr-3 text-gray-400">•</span>
            <span>Provide analytics and reporting.</span>
          </li>
          <li className="text-xs md:text-sm text-gray-700 flex items-start">
            <span className="mr-3 text-gray-400">•</span>
            <span>Improve platform features and user experience.</span>
          </li>
          <li className="text-xs md:text-sm text-gray-700 flex items-start">
            <span className="mr-3 text-gray-400">•</span>
            <span>Detect and prevent fraud.</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "information-you-provide",
    title: "Information You Provide",
    content: <div>Content for Information You Provide</div>,
  },
  {
    id: "data-security",
    title: "Data Security",
    content: <div>Content for Data Security</div>,
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: <div>Content for Data Retention</div>,
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: <div>Content for Your Rights</div>,
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    content: <div>Content for Children's Privacy</div>,
  },
  {
    id: "international-transfers",
    title: "International Data Transfers",
    content: <div>Content for International Data Transfers</div>,
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    content: <div>Content for Third-Party Links</div>,
  },
  {
    id: "updates-policy",
    title: "Updates to This Privacy Policy",
    content: <div>Content for Updates to This Privacy Policy</div>,
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: <div>Content for Contact Us</div>,
  },
];

export default function DataAndPrivacyPage(): JSX.Element {
  const [activeSection, setActiveSection] = useState("information-we-collect");
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.1,
        root: contentRef.current,
        rootMargin: "-10% 0px -80% 0px",
      }
    );

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  return (
    <PanelLayout>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Secondary Sidebar - Desktop Only */}
        <div className="hidden md:block">
          <SettingsSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile Header */}
          <SettingsHeader />

          <div className="p-4 ">
            {/* Yellow Header Section */}
            <div className="bg-khaki-200/70 rounded-md px-4 mb-4 md:px-6 py-2">
              <h1 className="text-2xl text-center font-semibold text-gray-900">
                Privacy Policy
              </h1>
            </div>
            {/* Data & Privacy Content */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* Content Section */}
              <div className="p-4 md:p-6">
                <div className="mb-8 text-sm text-center w-2/3 mx-auto md:text-base text-gray-700">
                  <p>
                    Growdex provides an AI-powered advertising platform and
                    marketing services that help businesses create, launch,
                    manage, and optimize digital advertising campaigns across
                    multiple platforms.
                  </p>
                </div>

                {/* Two Column Layout */}
                <div className="flex flex-col md:flex-row md:space-x-8 gap-4">
                  {/* Left Column */}
                  <div className="md:w-1/3">
                    <div className="space-y-3">
                      {sections.map((section, index) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left text-sm md:text-base font-medium px-3 py-2 rounded-md transition-colors ${
                            activeSection === section.id
                              ? "bg-red-100 text-red-700"
                              : "text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex">
                    <div className="h-full w-1 mr-2 bg-red-500 rounded-full" />
                    <div
                      ref={contentRef}
                      className="flex-1 max-h-screen overflow-y-auto hide-scrollbar space-y-12"
                    >
                      {sections.map((section, index) => (
                        <div
                          key={section.id}
                          id={section.id}
                          ref={(el) => {
                            observerRefs.current[index] = el;
                          }}
                        >
                          <h2 className="text-lg md:text-xl font-bold text-orange-600 mb-6">
                            {section.title}
                          </h2>
                          {section.content}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
