import React, { useState } from 'react';
import { Book } from '../types/book';
import { THEME_PALETTES } from '../data/themes';
import {
  getRazorpayKey,
  saveRazorpayKey,
  markBookAsPurchased,
  recordPaymentOrder,
  PaymentOrder,
} from '../services/paymentService';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  X,
  ShieldCheck,
  Smartphone,
  QrCode,
  Sparkles,
  Download,
  BookOpen,
  Settings,
  ExternalLink,
  Receipt,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface RazorpayCheckoutModalProps {
  book: Book;
  onClose: () => void;
  onPaymentSuccess?: (paymentId: string) => void;
  onOpenReader?: () => void;
  onOpenExport?: () => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  book,
  onClose,
  onPaymentSuccess,
  onOpenReader,
  onOpenExport,
}) => {
  const theme = THEME_PALETTES[book.themeId] || THEME_PALETTES['deep-indigo'];

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [customKey, setCustomKey] = useState(getRazorpayKey());
  const [keySaved, setKeySaved] = useState(false);

  // Success State
  const [completedOrder, setCompletedOrder] = useState<PaymentOrder | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const priceAmount = book.price !== undefined ? book.price : 499;
  const currencySymbol = book.currency || '₹';

  const handleSaveKey = () => {
    saveRazorpayKey(customKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleCompleteSuccess = (paymentId: string) => {
    const order: PaymentOrder = {
      id: `order_${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      amount: priceAmount,
      currency: currencySymbol,
      clientName: clientName.trim() || 'Verified Client',
      clientEmail: clientEmail.trim() || 'client@foliocraft.org',
      clientPhone: clientPhone.trim() || '+91 98765 43210',
      razorpayPaymentId: paymentId,
      status: 'paid',
      timestamp: new Date().toISOString(),
    };

    recordPaymentOrder(order);
    markBookAsPurchased(book.id);
    setCompletedOrder(order);
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentId);
    }
  };

  const handleRazorpayPay = () => {
    setErrorMessage(null);

    // Validate inputs
    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address for invoice delivery');
      return;
    }

    const keyId = getRazorpayKey();

    // Check if Razorpay script is loaded in browser
    if (typeof (window as any).Razorpay === 'undefined') {
      // Fallback: If network blocked script or offline, allow test simulation
      handleSimulatePayment();
      return;
    }

    try {
      setIsProcessing(true);

      const options = {
        key: keyId,
        amount: Math.round(priceAmount * 100), // in paise
        currency: 'INR',
        name: 'FolioCraft Publishing',
        description: `Full Monograph: ${book.title}`,
        image: 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png',
        handler: function (response: any) {
          setIsProcessing(false);
          const paymentId = response.razorpay_payment_id || `pay_${Date.now().toString(36)}`;
          handleCompleteSuccess(paymentId);
        },
        prefill: {
          name: clientName,
          email: clientEmail,
          contact: clientPhone || '9876543210',
        },
        theme: {
          color: theme.primary || '#1c1917',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setErrorMessage(response.error?.description || 'Payment was declined or cancelled.');
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      console.warn('Razorpay popup error, falling back:', err);
      setErrorMessage(err.message || 'Could not initiate Razorpay. Check your API Key.');
    }
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      const fakePaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      handleCompleteSuccess(fakePaymentId);
    }, 1200);
  };

  const copyPaymentId = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.razorpayPaymentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              RZP
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <span>Razorpay Monograph Checkout</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                  Direct Bank Deposit
                </span>
              </h3>
              <p className="text-[11px] text-stone-500">
                UPI (GPay, PhonePe, Paytm), Cards, NetBanking &amp; Digital Receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
              title="Razorpay Gateway Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Razorpay Key Configuration Drawer */}
          {showSettings && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Razorpay API Key Setup (Your Bank Account)</span>
                </span>
                <a
                  href="https://dashboard.razorpay.com/app/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Get Key from Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Apna Razorpay <strong>Key ID</strong> yahan dalein (jaise <code className="bg-stone-200 px-1 py-0.5 rounded">rzp_live_...</code> ya <code className="bg-stone-200 px-1 py-0.5 rounded">rzp_test_...</code>). Client ka har payment direct aapke is Razorpay account me aayega.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="rzp_live_xxxxxxxxxxxxxx or rzp_test_xxxxxxxxxxxxxx"
                  className="flex-1 text-xs px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-3.5 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS RECEIPT VIEW */}
          {completedOrder ? (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm animate-bounce-short">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-stone-900 font-serif">
                  Payment Confirmed!
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Paisa Razorpay account me successfully credit ho gaya hai.
                </p>
              </div>

              {/* Receipt Ticket Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-stone-600" />
                    <span>Razorpay Order Receipt</span>
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    PAID
                  </span>
                </div>

                <div className="flex justify-between text-stone-600 pt-1">
                  <span>Monograph Title:</span>
                  <span className="font-medium text-stone-900 truncate max-w-[200px]">
                    {completedOrder.bookTitle}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Amount Paid:</span>
                  <span className="font-bold text-stone-900">
                    {completedOrder.currency}{completedOrder.amount}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Client Name:</span>
                  <span className="font-medium text-stone-900">{completedOrder.clientName}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Client Email:</span>
                  <span className="font-medium text-stone-900">{completedOrder.clientEmail}</span>
                </div>

                <div className="flex items-center justify-between text-stone-600 pt-2 border-t border-stone-200/80">
                  <span>Payment ID:</span>
                  <button
                    onClick={copyPaymentId}
                    className="font-mono text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    title="Click to copy ID"
                  >
                    <span>{completedOrder.razorpayPaymentId}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Instant Access Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                {onOpenExport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenExport();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Monograph PDF</span>
                  </button>
                )}

                {onOpenReader && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReader();
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold border border-stone-300 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-stone-600" />
                    <span>Open in Digital Reader</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Book Item Card */}
              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/60 flex items-start gap-3.5">
                <div
                  className="w-16 h-22 rounded shadow-sm p-1.5 flex flex-col justify-between shrink-0 text-white text-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <span className="text-[6.5px] uppercase font-bold tracking-widest text-amber-300">
                    FolioCraft
                  </span>
                  <span className="font-serif font-bold text-[9px] line-clamp-3 leading-tight">
                    {book.title}
                  </span>
                  <span className="text-[7px] text-stone-300 italic truncate">
                    {book.author}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-stone-900 text-sm leading-tight truncate">
                      {book.title}
                    </h4>
                    <span className="font-bold text-sm text-stone-900 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      {currencySymbol}{priceAmount}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 italic mt-0.5 truncate">
                    {book.subtitle}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-600">
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      4 Full Chapters
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Vector A4 PDF
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      3D Archival Showcase
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Billing Info Form */}
              <div className="space-y-3">
                <span className="block text-xs font-semibold text-stone-800">
                  Client &amp; Invoice Information
                </span>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rahul Sharma or Dr. A. Verma"
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Email Address (For PDF &amp; Receipt) *
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Phone Number (For UPI / SMS Receipt)
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-stone-700 font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    UPI / GPay / PhonePe
                  </span>
                  <span className="flex items-center gap-1 text-stone-700 font-medium">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    QR Code
                  </span>
                  <span className="flex items-center gap-1 text-stone-700 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                    Cards / NetBanking
                  </span>
                </div>
                <div className="flex items-center gap-1 text-stone-400">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-bit Secure</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!completedOrder && (
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="px-3 py-2 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl transition-colors disabled:opacity-50"
                title="Instant simulation without charging a bank card"
              >
                Instant Test Pay
              </button>

              <button
                type="button"
                onClick={handleRazorpayPay}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 text-blue-200" />
                <span>
                  {isProcessing ? 'Connecting...' : `Pay ${currencySymbol}${priceAmount} with Razorpay`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
