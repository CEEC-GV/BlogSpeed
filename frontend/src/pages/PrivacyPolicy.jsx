import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      icon: <Eye className="w-5 h-5" />,
      title: "1. Information We Collect",
      content: `We collect several types of information to provide and improve our Service:

**Information You Provide Directly:**
• Account information (name, email address, password)
• Company details and website information
• Payment and billing information
• Content you create, upload, or generate using the Service
• Communications with our support team
• Feedback, survey responses, and testimonials

**Information Collected Automatically:**
• Usage data (features used, time spent, interaction patterns)
• Device information (browser type, operating system, device identifiers)
• Log data (IP address, access times, pages viewed)
• Cookies and similar tracking technologies
• Performance metrics and error reports

**Information from Third Parties:**
• Authentication providers (Google, GitHub, etc.)
• Payment processors
• Analytics services
• Integration partners and connected applications`
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "2. How We Use Your Information",
      content: `We use the collected information for the following purposes:

**Service Delivery:**
• Provide, maintain, and improve the BlogSpeeds platform
• Process transactions and send transaction notifications
• Generate AI-powered content based on your inputs
• Enable blog integration and SEO optimization features
• Provide customer support and respond to inquiries

**Communication:**
• Send service-related announcements and updates
• Deliver marketing communications (with your consent)
• Send newsletters, tips, and educational content
• Notify you of new features or changes to the Service

**Analytics and Improvement:**
• Analyze usage patterns to improve functionality
• Conduct research and development for new features
• Monitor and analyze trends and user preferences
• Perform A/B testing and optimize user experience

**Security and Compliance:**
• Detect, prevent, and address fraud or security issues
• Enforce our Terms and Conditions
• Comply with legal obligations and regulatory requirements
• Protect the rights, property, and safety of BlogSpeeds and users`
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "3. Data Sharing and Disclosure",
      content: `We value your privacy and limit data sharing. We may share your information in the following circumstances:

**Service Providers:**
We work with third-party companies to support our operations, including:
• Cloud hosting providers (AWS, Google Cloud)
• Payment processors (Stripe, PayPal)
• Email service providers
• Analytics platforms (Google Analytics, Mixpanel)
• Customer support tools
• AI model providers

These providers are contractually obligated to protect your data and use it only for specified purposes.

**Business Transfers:**
If BlogSpeeds is involved in a merger, acquisition, or sale of assets, your information may be transferred. We will provide notice before your personal data is transferred and becomes subject to a different privacy policy.

**Legal Requirements:**
We may disclose your information if required to do so by law or in response to:
• Valid legal requests from law enforcement or government authorities
• Court orders or subpoenas
• Protection of our legal rights or property
• Investigation of potential violations of our Terms
• Protection of the safety of users or the public

**With Your Consent:**
We may share information with your explicit consent for purposes not covered in this policy.

**Aggregate Data:**
We may share aggregated, de-identified data that cannot be used to identify you personally for research, marketing, or analytics purposes.`
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "4. Data Security",
      content: `We implement robust security measures to protect your personal information:

**Technical Safeguards:**
• End-to-end encryption for data in transit (TLS/SSL)
• Encryption of sensitive data at rest
• Regular security audits and penetration testing
• Secure authentication mechanisms (password hashing, multi-factor authentication)
• Firewall protection and intrusion detection systems
• Regular security updates and patch management

**Administrative Safeguards:**
• Access controls limiting who can view your data
• Background checks for employees with data access
• Security training for all team members
• Incident response procedures
• Regular review of security practices

**Physical Safeguards:**
• Secure data centers with controlled access
• Environmental controls and redundancy
• 24/7 monitoring and surveillance

While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, and you transmit information at your own risk.

In the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by law.`
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      title: "5. Your Privacy Rights",
      content: `Depending on your location, you may have certain rights regarding your personal information:

**Access and Portability:**
• Request access to the personal data we hold about you
• Receive a copy of your data in a structured, commonly used format
• Transfer your data to another service provider

**Correction and Update:**
• Update or correct inaccurate personal information
• Complete incomplete data in your account settings

**Deletion (Right to be Forgotten):**
• Request deletion of your personal information
• Note: Some data may be retained for legal or legitimate business purposes

**Restriction and Objection:**
• Restrict or object to certain processing of your data
• Opt-out of marketing communications
• Disable certain types of cookies

**Withdraw Consent:**
• Withdraw consent for data processing based on consent
• Note: This does not affect the lawfulness of processing before withdrawal

**Data Protection Authority:**
• Lodge a complaint with your local data protection authority if you believe your rights have been violated

To exercise these rights, contact us at privacy@blogspeeds.com. We will respond within 30 days of receiving your request.

**California Residents:**
California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what information we collect, the right to deletion, and the right to opt-out of the sale of personal information. We do not sell personal information.

**European Users:**
Users in the European Economic Area (EEA) have rights under the General Data Protection Regulation (GDPR), including all rights mentioned above. Our legal basis for processing includes consent, contract performance, legal obligations, and legitimate interests.`
    },
    {
      title: "6. Cookies and Tracking Technologies",
      content: `We use cookies and similar technologies to enhance your experience:

**Types of Cookies We Use:**

Essential Cookies:
• Required for the Service to function properly
• Enable core features like authentication and security
• Cannot be disabled without affecting functionality

Performance Cookies:
• Collect information about how you use the Service
• Help us understand usage patterns and improve performance
• Example: Google Analytics

Functional Cookies:
• Remember your preferences and settings
• Personalize your experience
• Example: language preferences, theme choices

Marketing Cookies:
• Track your browsing across websites
• Deliver targeted advertisements
• Measure advertising effectiveness

**Managing Cookies:**
You can control cookies through your browser settings. Note that disabling certain cookies may limit functionality.

**Do Not Track:**
We currently do not respond to Do Not Track signals, as there is no industry standard for compliance.

**Third-Party Tracking:**
Some third-party services may use their own cookies. We are not responsible for their privacy practices. Review their privacy policies for more information.`
    },
    {
      title: "7. AI and Machine Learning",
      content: `BlogSpeeds uses artificial intelligence and machine learning to provide content generation services. Here's how we handle data in AI processing:

**Training Data:**
• We may use aggregated, de-identified content to improve AI models
• Personal information is removed before any data is used for training
• You can opt-out of contributing to model training in your settings

**Content Generation:**
• Your input prompts and content are processed by AI models
• Generated content is stored in your account and may be analyzed to improve the Service
• We do not share your specific content with third parties except as necessary to provide the Service

**Data Retention for AI:**
• Input data may be retained temporarily for processing and debugging
• Logs are typically deleted after 30 days unless needed for security or legal purposes

**AI Limitations:**
• AI-generated content may be inaccurate or inappropriate
• You are responsible for reviewing and editing AI-generated content
• We are not liable for content generated by AI models`
    },
    {
      title: "8. Children's Privacy",
      content: `BlogSpeeds is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children under 16.

If we become aware that we have collected personal information from a child under 16 without parental consent, we will take steps to delete that information as quickly as possible.

If you believe we have collected information from a child under 16, please contact us immediately at privacy@blogspeeds.com.

Parents and guardians should monitor their children's online activities and help enforce this policy by instructing children never to provide personal information through the Service without permission.`
    },
    {
      title: "9. International Data Transfers",
      content: `BlogSpeeds is based in [Your Country], and your information may be transferred to and processed in countries outside your country of residence.

**Data Transfer Mechanisms:**
• Standard Contractual Clauses approved by the European Commission
• Adequacy decisions recognizing equivalent data protection
• Your explicit consent for transfers

**Data Protection:**
When we transfer data internationally, we ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.

If you are located in the EEA or UK, your personal data may be transferred to countries that do not provide an equivalent level of data protection. We implement appropriate safeguards, including Standard Contractual Clauses, to ensure your data remains protected.`
    },
    {
      title: "10. Data Retention",
      content: `We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy.

**Account Data:**
• Retained while your account is active
• Retained for a reasonable period after account closure for legal and business purposes
• Can be deleted upon request, subject to legal retention requirements

**Content Data:**
• Stored while you maintain an active subscription
• May be retained for a grace period after cancellation
• Backups may be retained for up to 90 days

**Usage Data:**
• Typically retained for 24 months
• Aggregated data may be retained indefinitely

**Legal Requirements:**
• Some data must be retained to comply with legal obligations (e.g., tax records for 7 years)
• Data may be retained for legal claims or disputes

You may request deletion of your data by contacting privacy@blogspeeds.com. We will delete your data unless we have a legal obligation or legitimate business reason to retain it.`
    },
    {
      title: "11. Third-Party Links and Services",
      content: `The Service may contain links to third-party websites, applications, or services that are not operated by BlogSpeeds.

**Our Responsibility:**
• We are not responsible for the privacy practices of third-party services
• This Privacy Policy does not apply to third-party websites or services
• We do not control or endorse third-party content or services

**Your Responsibility:**
• Review the privacy policies of any third-party services you use
• Understand how third parties collect, use, and share your information
• Make informed decisions about sharing your information with third parties

**Integrated Services:**
When you connect third-party services (e.g., Google Drive, WordPress), those services may access certain information according to their own privacy policies. Review the permissions requested by integrated services before connecting them.`
    },
    {
      title: "12. Marketing Communications",
      content: `We may send you marketing communications about our Service, new features, promotions, and related information.

**Your Choices:**
• Opt-out of marketing emails by clicking the "unsubscribe" link in any marketing email
• Manage communication preferences in your account settings
• Contact us at privacy@blogspeeds.com to update your preferences

**Types of Communications:**
• Service announcements (cannot be disabled for active accounts)
• Product updates and new features
• Educational content and tips
• Promotional offers and discounts
• Newsletters and blog posts

Even if you opt-out of marketing communications, we will still send you transactional messages related to your account, such as:
• Account notifications
• Billing statements
• Security alerts
• Service updates that affect your account`
    },
    {
      title: "13. Changes to This Privacy Policy",
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.

**Notification of Changes:**
• We will post the updated Privacy Policy on this page
• We will update the "Last Updated" date
• For material changes, we will provide additional notice (e.g., email notification, prominent notice on our website)

**Your Continued Use:**
Your continued use of the Service after changes to this Privacy Policy constitutes acceptance of the updated policy. If you do not agree to the changes, you should discontinue use of the Service and contact us to close your account.

We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.`
    },
    {
      title: "14. Contact Us",
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:

**Email:** privacy@blogspeeds.com
**Support:** support@blogspeeds.com
**Address:** [Your Business Address]

**Data Protection Officer:**
If you are located in the EEA or UK, you may contact our Data Protection Officer at dpo@blogspeeds.com

**Response Time:**
We aim to respond to all privacy-related inquiries within 30 days. For urgent matters, please indicate "URGENT" in your subject line.

**Complaints:**
If you believe your privacy rights have been violated, you have the right to lodge a complaint with your local data protection authority.`
    },
    {
      title: "15. Additional Information",
      content: `**Automated Decision-Making:**
We may use automated systems to analyze your usage and provide personalized recommendations. You have the right to object to automated decision-making that significantly affects you.

**User-Generated Content:**
Content you publish or make publicly available through the Service may be viewed by other users and the public. Exercise caution when sharing sensitive information.

**Account Security:**
You are responsible for maintaining the security of your account credentials. Use a strong, unique password and enable multi-factor authentication when available.

**Data Accuracy:**
You are responsible for ensuring the accuracy of information you provide. Inaccurate information may affect the quality of our Service.

**Business Users:**
If you use BlogSpeeds on behalf of an organization, your organization's privacy policy may also apply. Consult with your organization's privacy or legal team.

Last Updated: February 14, 2026`
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      {/* Animated Dot Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8" />
              <span className="text-xl font-bold">BlogSpeeds</span>
            </div>
            <a href="/">
              <button className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium hover:bg-white/5 transition border border-white/10">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-sm mb-8 animate-fade-in">
            <Shield className="w-4 h-4" />
            <span>Your Data, Protected</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-none animate-fade-in-up">
            Privacy<br />
            <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            We take your privacy seriously. Learn how we collect, use, and protect your information.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-white/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Last Updated: February 14, 2026</span>
            </div>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="max-w-4xl mx-auto px-6 pb-12">
          <div className="border border-white/20 rounded-2xl p-8 backdrop-blur bg-gradient-to-br from-white/10 to-transparent">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              Privacy at a Glance
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-bold">Secure Storage</h3>
                <p className="text-sm text-white/60">Your data is encrypted and stored securely using industry-standard protocols</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">No Data Selling</h3>
                <p className="text-sm text-white/60">We never sell your personal information to third parties</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold">Your Control</h3>
                <p className="text-sm text-white/60">Access, export, or delete your data at any time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <div 
                key={idx}
                className="border border-white/10 rounded-2xl p-8 backdrop-blur bg-white/5 hover:bg-white/10 transition-all animate-fade-in-up"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    {section.icon || <Shield className="w-4 h-4" />}
                  </div>
                  {section.title}
                </h2>
                <div className="text-white/70 leading-relaxed whitespace-pre-line pl-11">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* GDPR/CCPA Badge */}
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="border border-white/10 rounded-2xl p-6 backdrop-blur bg-white/5 text-center">
              <div className="text-4xl mb-3">🇪🇺</div>
              <h3 className="font-bold mb-2">GDPR Compliant</h3>
              <p className="text-sm text-white/60">We comply with EU General Data Protection Regulation standards</p>
            </div>
            <div className="border border-white/10 rounded-2xl p-6 backdrop-blur bg-white/5 text-center">
              <div className="text-4xl mb-3">🇺🇸</div>
              <h3 className="font-bold mb-2">CCPA Compliant</h3>
              <p className="text-sm text-white/60">We respect California Consumer Privacy Act rights</p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-white/60 mb-6">
              Have questions about our privacy practices?
            </p>
            <a href="mailto:privacy@blogspeeds.com">
              <button className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-white/90 transition">
                Contact Privacy Team
              </button>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6" />
                <span className="text-xl font-bold">BlogSpeeds</span>
              </div>
              <div className="flex gap-8 text-sm text-white/60">
                <a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition">Terms</a>
                <a href="mailto:support@blogspeeds.com" className="hover:text-white transition">Contact</a>
              </div>
              <div className="text-sm text-white/40">
                © 2026 BlogSpeeds. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;