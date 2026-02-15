import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Shield, FileText, Scale } from 'lucide-react';

const TermsConditions = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using BlogSpeeds ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms and Conditions, please do not use the Service.

These Terms constitute a legally binding agreement between you and BlogSpeeds. We reserve the right to update these Terms at any time, and your continued use of the Service after such modifications constitutes acceptance of the updated Terms.`
    },
    {
      title: "2. Description of Service",
      content: `BlogSpeeds provides an AI-powered blog content generation and integration platform that allows users to:

• Generate SEO-optimized blog content using artificial intelligence
• Integrate blog functionality directly into product pages
• Access an administrative dashboard for content management
• Utilize automated SEO and AEO optimization tools
• Monitor analytics and performance metrics

The Service is provided on a subscription basis with various pricing tiers, including a free trial period for eligible new users.`
    },
    {
      title: "3. User Accounts and Registration",
      content: `To use certain features of the Service, you must register for an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Maintain the security of your password and account
• Accept responsibility for all activities that occur under your account
• Immediately notify BlogSpeeds of any unauthorized use of your account

You are responsible for all content generated and published using your account. BlogSpeeds reserves the right to refuse service, terminate accounts, or remove content at our sole discretion.`
    },
    {
      title: "4. Subscription and Payment Terms",
      content: `Subscription fees are billed in advance on a monthly or annual basis, depending on your chosen plan. You agree to:

• Provide valid payment information for your chosen subscription tier
• Pay all fees associated with your subscription
• Understand that fees are non-refundable except as required by law
• Accept automatic renewal of your subscription unless cancelled

Free trial periods, if offered, are available only once per user. We reserve the right to modify pricing with 30 days' notice to active subscribers. Failure to pay may result in immediate suspension or termination of your account.`
    },
    {
      title: "5. Acceptable Use Policy",
      content: `You agree not to use the Service to:

• Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable
• Violate any intellectual property rights or proprietary rights of others
• Distribute spam, malware, or other malicious code
• Attempt to gain unauthorized access to the Service or its related systems
• Use the Service for any purpose that competes with BlogSpeeds
• Scrape, data mine, or reverse engineer the Service
• Generate content that violates third-party terms of service or platform policies

Violation of this policy may result in immediate termination of your account without refund.`
    },
    {
      title: "6. Intellectual Property Rights",
      content: `BlogSpeeds and its licensors own all rights, title, and interest in and to the Service, including all software, technology, designs, and trademarks. Your use of the Service does not grant you ownership of any intellectual property rights.

Content generated using the Service: You retain ownership of content you create using BlogSpeeds' tools, subject to our license to host, display, and process such content as necessary to provide the Service. You represent and warrant that you have all necessary rights to any input content you provide to the Service.

You grant BlogSpeeds a worldwide, non-exclusive, royalty-free license to use, reproduce, and display generated content solely for the purpose of providing and improving the Service, and for promotional purposes with your consent.`
    },
    {
      title: "7. AI-Generated Content Disclaimer",
      content: `BlogSpeeds uses artificial intelligence to generate content. You acknowledge and agree that:

• AI-generated content may contain errors, inaccuracies, or biases
• You are responsible for reviewing, editing, and verifying all generated content before publication
• BlogSpeeds does not guarantee the accuracy, completeness, or quality of AI-generated content
• You bear sole responsibility for content published using the Service
• BlogSpeeds is not liable for any damages resulting from the use of AI-generated content

You should always review AI-generated content for factual accuracy, brand alignment, and compliance with applicable laws and regulations before publication.`
    },
    {
      title: "8. SEO and Performance Claims",
      content: `While BlogSpeeds employs SEO best practices and optimization techniques, we make no guarantees regarding:

• Search engine rankings or positioning
• Increases in website traffic or user engagement
• Conversion rates or revenue generation
• Specific timeframes for results

SEO performance depends on numerous factors outside our control, including search engine algorithms, competition, website quality, and market conditions. Past results and testimonials do not guarantee future performance.`
    },
    {
      title: "9. Data Privacy and Security",
      content: `BlogSpeeds takes data privacy and security seriously. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.

You acknowledge that:
• Data transmission over the internet is not completely secure
• We implement reasonable security measures but cannot guarantee absolute security
• You are responsible for maintaining the confidentiality of your login credentials
• You should review our Privacy Policy to understand our data practices`
    },
    {
      title: "10. Third-Party Integrations",
      content: `The Service may integrate with or contain links to third-party websites, services, or applications. BlogSpeeds is not responsible for:

• The content, privacy policies, or practices of third-party services
• Any damage or loss caused by third-party services
• The availability or performance of third-party integrations

Your use of third-party services is governed by their respective terms and conditions. We recommend reviewing the terms of any third-party service you use in connection with BlogSpeeds.`
    },
    {
      title: "11. Service Availability and Modifications",
      content: `BlogSpeeds strives to provide reliable service but does not guarantee uninterrupted access. We reserve the right to:

• Modify, suspend, or discontinue any aspect of the Service at any time
• Perform scheduled or emergency maintenance
• Implement updates, upgrades, or changes to features
• Limit certain features or restrict access to parts of the Service

We will attempt to provide notice of significant changes but are not obligated to do so. Downtime or service interruptions do not entitle you to refunds or credits except as specified in your subscription agreement.`
    },
    {
      title: "12. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLOGSPEEDS AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR:

• Any indirect, incidental, special, consequential, or punitive damages
• Loss of profits, revenue, data, or business opportunities
• Service interruptions or data loss
• Damages arising from use or inability to use the Service
• Any content generated by the Service

Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid to BlogSpeeds in the twelve (12) months preceding the claim.

Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.`
    },
    {
      title: "13. Indemnification",
      content: `You agree to indemnify, defend, and hold harmless BlogSpeeds and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:

• Your access to or use of the Service
• Your violation of these Terms
• Your violation of any third-party rights, including intellectual property rights
• Content you generate, publish, or distribute using the Service
• Your violation of any applicable laws or regulations

This indemnification obligation survives termination of your account and these Terms.`
    },
    {
      title: "14. Termination",
      content: `Either party may terminate this agreement at any time:

You may cancel your subscription through your account settings or by contacting support. Cancellation will be effective at the end of your current billing period, and you will retain access until that date.

We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including:
• Breach of these Terms
• Violation of our Acceptable Use Policy
• Fraudulent or illegal activity
• Non-payment of fees

Upon termination, your right to use the Service ceases immediately. We may delete your account data in accordance with our data retention policies.`
    },
    {
      title: "15. Dispute Resolution and Arbitration",
      content: `Any dispute arising from these Terms or the Service shall be resolved through binding arbitration, except that either party may seek injunctive relief in court for intellectual property infringement.

Arbitration shall be conducted by a single arbitrator in accordance with the rules of the American Arbitration Association. The arbitration shall take place in [Your Jurisdiction], and judgment on the arbitration award may be entered in any court having jurisdiction.

You agree to waive any right to a jury trial or to participate in a class action lawsuit. This arbitration agreement survives termination of these Terms.`
    },
    {
      title: "16. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.

Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions will remain in effect.`
    },
    {
      title: "17. Contact Information",
      content: `If you have any questions about these Terms and Conditions, please contact us:

Email: legal@blogspeeds.com
Address: [Your Business Address]
Support: support@blogspeeds.com

For billing inquiries: billing@blogspeeds.com
For privacy concerns: privacy@blogspeeds.com`
    },
    {
      title: "18. Entire Agreement",
      content: `These Terms and Conditions, together with our Privacy Policy and any other legal notices or agreements published by BlogSpeeds on the Service, constitute the entire agreement between you and BlogSpeeds concerning the Service.

These Terms supersede all prior or contemporaneous communications and proposals, whether electronic, oral, or written, between you and BlogSpeeds with respect to the Service.

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
            <Scale className="w-4 h-4" />
            <span>Legal Documentation</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-none animate-fade-in-up">
            Terms &<br />
            <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
              Conditions
            </span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Please read these terms carefully before using BlogSpeeds
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-white/50 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Last Updated: February 14, 2026</span>
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
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4" />
                  </div>
                  {section.title}
                </h2>
                <div className="text-white/70 leading-relaxed whitespace-pre-line pl-11">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="mt-16 border-2 border-white/20 rounded-2xl p-8 backdrop-blur bg-gradient-to-br from-white/10 to-transparent">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Important Notice</h3>
                <p className="text-white/70 leading-relaxed mb-4">
                  By using BlogSpeeds, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please discontinue use of the Service immediately.
                </p>
                <p className="text-white/70 leading-relaxed">
                  These terms may be updated from time to time. Continued use of the Service after changes constitutes acceptance of the modified terms. We recommend reviewing this page periodically.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-white/60 mb-6">
              Have questions about our Terms and Conditions?
            </p>
            <a href="mailto:legal@blogspeeds.com">
              <button className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-white/90 transition">
                Contact Legal Team
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

export default TermsConditions;