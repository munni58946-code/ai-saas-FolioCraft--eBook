import React, { useState } from 'react';
import {
  getRazorpayKey,
  saveRazorpayKey,
  getPaymentOrders,
  PaymentOrder,
  DEFAULT_RAZORPAY_KEY,
} from '../services/paymentService';
import {
  CreditCard,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Receipt,
  HelpCircle,
  Copy,
} from 'lucide-react';

interface RazorpaySettingsModalProps {
  onClose: () => void;
}

export const RazorpaySettingsModal: React.FC<RazorpaySettingsModalProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState(getRazorpayKey());
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'keys' | 'orders'>('keys');
  const [orders] = useState<PaymentOrder[]>(getPaymentOrders());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveRazorpayKey(apiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(txt);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              RZP
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <span>Razorpay Gateway &amp; Direct Bank Settlement</span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Collect client payments directly into your Indian bank account via UPI &amp; Cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-2 border-b border-stone-200 bg-stone-50/40">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'keys'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            API Credentials &amp; Bank Setup
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Client Orders &amp; Receipts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-bold">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'keys' ? (
            <div className="space-y-5">
              {/* How it works card */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>How Razorpay Direct Bank Settlement Works:</span>
                </div>
                <p className="text-xs text-blue-950/80 leading-relaxed">
                  Jab koi client aapki website par kisi bhi monograph par <strong>"Buy"</strong> click karega, wo PhonePe, Google Pay, Paytm, UPI QR ya Cards se pay karega. Yeh payment <strong>direct aapke Razorpay linked bank account</strong> me T+1 days me deposit ho jayega.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-stone-800">
                        Razorpay Key ID
                      </label>
                      {apiKey.startsWith('rzp_live_') ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          🟢 Live Mode (Real Money to Bank)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          🟡 Test / Sandbox Mode
                        </span>
                      )}
                    </div>
                    <a
                      href="https://dashboard.razorpay.com/app/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Razorpay Dashboard &gt; API Keys</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="rzp_live_xxxxxxxxxxxxxx or rzp_test_xxxxxxxxxxxxxx"
                    className="w-full text-xs font-mono px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-stone-900 bg-white"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Aap kabhi bhi apni <strong>Key ID</strong> change ya regenerate karke yahan paste kar sakte hain. Sirf <strong>Key ID</strong> chahiye, <em>Key Secret</em> ki frontend me zaroorat nahi hoti.
                  </p>
                </div>

                {/* Step by step guide */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                    <span>Pehle Se Account Hai Toh Key Kaise Badlein / Generate Karein:</span>
                  </span>
                  <ol className="text-xs text-stone-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
                    <li>
                      Apne Razorpay Dashboard (<a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">dashboard.razorpay.com</a>) me login karein.
                    </li>
                    <li>
                      Left menu me <strong>Account &amp; Settings ➔ API Keys</strong> par jayein.
                    </li>
                    <li>
                      Agar purani key replace karni hai, toh <strong>"Regenerate Key"</strong> ya <strong>"Generate Key"</strong> par click karein.
                    </li>
                    <li>
                      Wahan jo <strong>Key ID</strong> (<code className="bg-stone-200 px-1 py-0.5 rounded">rzp_live_...</code>) dikhe, use copy karke yahan paste karein aur <strong>"Save Razorpay Key"</strong> daba dein!
                    </li>
                  </ol>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setApiKey(DEFAULT_RAZORPAY_KEY)}
                    className="text-xs text-stone-500 hover:text-stone-800 underline"
                  >
                    Reset to Default Sandbox Key
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : null}
                    <span>{isSaved ? 'Settings Saved Successfully!' : 'Save Razorpay Key'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Orders tab */
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-stone-400 space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-xs font-medium text-stone-600">No client orders recorded yet.</p>
                  <p className="text-[11px] text-stone-400">
                    When clients purchase monographs, payment IDs and receipts will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-stone-900">{ord.bookTitle}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Client: <span className="text-stone-700 font-medium">{ord.clientName}</span> ({ord.clientEmail})
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {new Date(ord.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-bold text-stone-900 text-sm">
                          {ord.currency}{ord.amount}
                        </div>
                        <button
                          onClick={() => copyText(ord.razorpayPaymentId)}
                          className="font-mono text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-auto"
                          title="Copy Payment ID"
                        >
                          <span>{ord.razorpayPaymentId}</span>
                          {copiedId === ord.razorpayPaymentId ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
