// Billing and subscription types

export type PlanType = 'starter' | 'professional' | 'enterprise';

export type BillingInterval = 'monthly' | 'annual';

export type PaymentStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  interval: BillingInterval;
  features: PlanFeature[];
  limits: PlanLimits;
  popular?: boolean;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

export interface PlanLimits {
  screenshotsPerMonth: number;
  teamMembers: number;
  apiAccess: boolean;
  prioritySupport: boolean;
  customIntegrations: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  status: PaymentStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export interface UsageStats {
  screenshotsUsed: number;
  screenshotsLimit: number;
  period: {
    start: Date;
    end: Date;
  };
  percentageUsed: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: Date;
  downloadUrl: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface BillingHistory {
  invoices: Invoice[];
  totalPages: number;
  currentPage: number;
}
