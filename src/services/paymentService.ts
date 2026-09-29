export interface PaymentOrder {
  id: string;
  bookId: string;
  bookTitle: string;
  amount: number; // in rupees
  currency: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  status: 'paid' | 'pending' | 'failed';
  timestamp: string;
}

const RAZORPAY_KEY_STORAGE = 'foliocraft_razorpay_key_id';
const PURCHASED_BOOKS_STORAGE = 'foliocraft_purchased_books';
const PAYMENT_ORDERS_STORAGE = 'foliocraft_payment_orders';

// Default public sandbox test key ID for instant preview / testing
// Users can configure their own Razorpay Key ID (Live or Test) in the settings modal
export const DEFAULT_RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag';

export function getRazorpayKey(): string {
  try {
    return localStorage.getItem(RAZORPAY_KEY_STORAGE) || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || DEFAULT_RAZORPAY_KEY;
  } catch {
    return DEFAULT_RAZORPAY_KEY;
  }
}

export function saveRazorpayKey(key: string): void {
  try {
    localStorage.setItem(RAZORPAY_KEY_STORAGE, key.trim());
  } catch (e) {
    console.error('Failed to save Razorpay key', e);
  }
}

export function getPurchasedBookIds(): string[] {
  try {
    const raw = localStorage.getItem(PURCHASED_BOOKS_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookPurchased(bookId: string, bookPrice?: number): boolean {
  if (bookPrice === 0) return true; // Open access is always free
  const ids = getPurchasedBookIds();
  return ids.includes(bookId);
}

export function markBookAsPurchased(bookId: string): void {
  try {
    const ids = getPurchasedBookIds();
    if (!ids.includes(bookId)) {
      ids.push(bookId);
      localStorage.setItem(PURCHASED_BOOKS_STORAGE, JSON.stringify(ids));
    }
  } catch (e) {
    console.error('Failed to mark book as purchased', e);
  }
}

export function getPaymentOrders(): PaymentOrder[] {
  try {
    const raw = localStorage.getItem(PAYMENT_ORDERS_STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordPaymentOrder(order: PaymentOrder): void {
  try {
    const orders = getPaymentOrders();
    orders.unshift(order);
    localStorage.setItem(PAYMENT_ORDERS_STORAGE, JSON.stringify(orders.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save payment order', e);
  }
}
