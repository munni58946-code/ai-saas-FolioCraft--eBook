import React, { useState } from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Mail, Phone, ExternalLink } from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'refund' | 'contact';

interface LegalPoliciesModalProps {
  initialTab?: PolicyTab;
  onClose: () => void;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Legal, Compliance &amp; Customer Policies
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Standard consumer protection, digital delivery, and Razorpay merchant compliance policies.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 px-6 pt-2 border-b border-stone-200 bg-stone-50/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Terms &amp; Conditions
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'refund'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Refund &amp; Cancellation
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Contact &amp; Support
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-xs text-stone-600 space-y-4 leading-relaxed font-sans">
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-stone-900">1. Terms of Service</h4>
              <p>
                Welcome to FolioCraft Publishing. By accessing or purchasing digital monographs, eBooks, and vector PDF materials from our platform, you agree to comply with and be bound by the following terms.
              </p>
              <h5 className="font-semibold text-stone-800">Digital Content Delivery</h5>
              <p>
                All monographs and vector PDF files purchased on this website are delivered electronically and instantaneously upon successful payment confirmation via our payment gateway (Razorpay). No physical shipment is required.
              </p>
              <h5 className="font-semibold text-stone-800">Intellectual Property</h5>
              <p>
                All literary compositions, layout styles, and typographical architectures remain the intellectual property of FolioCraft or respective authors. Purchasing grants an individual, non-exclusive license for personal reading and research.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-stone-900">2. Privacy Policy</h4>
              <p>
                We respect your personal privacy. We only collect essential customer data required to fulfill digital purchases, verify transactions with Razorpay, and sync your library state.
              </p>
              <h5 className="font-semibold text-stone-800">Data We Collect</h5>
              <p>
                Customer name, email address, and transaction identifiers. We do not store or process debit/credit card numbers or UPI PINs on our servers; all payment processing is handled securely by Razorpay.
              </p>
              <h5 className="font-semibold text-stone-800">Third-Party Security</h5>
              <p>
                Transactions are secured with 256-bit encryption through Razorpay Payment Services adhering strictly to RBI and PCI-DSS compliance regulations.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-stone-900">3. Refund &amp; Cancellation Policy</h4>
              <p>
                Because our products are delivered electronically in full immediately upon checkout (including access to vector PDF downloads and browser readers), digital goods are generally non-refundable once unlocked.
              </p>
              <h5 className="font-semibold text-stone-800">Exception &amp; Failed Transactions</h5>
              <p>
                If your account is debited but payment fails to unlock the monograph due to technical errors, Razorpay automatically initiates an instant reversal back to your original payment method within 3 to 5 business days. You may also contact our support team with your Payment ID for manual unlocking or manual refund.
              </p>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-stone-900">4. Contact &amp; Support</h4>
              <p>
                For questions regarding book purchases, billing queries, or technical assistance with vector PDF downloads:
              </p>
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-stone-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-500" />
                  <span>Email: <strong>support@foliocraft.org</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-500" />
                  <span>Support Hours: Monday to Saturday, 10:00 AM – 6:00 PM IST</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500">
                Merchant inquiries and publisher accounts are governed under Indian jurisdiction in accordance with IT Act 2000.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50/80 border-t border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PCI-DSS &amp; RBI Compliant Merchant Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
