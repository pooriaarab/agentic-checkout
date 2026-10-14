export class VendorError extends Error {
  readonly code = "VENDOR_FAILED";
  readonly status?: number;
  constructor(message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause }); this.name = "VendorError"; this.status = options.status;
  }
}

export interface CreatePaymentLinkInput {
  priceId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  dryRun?: boolean;
}
export interface PaymentLink {
  id: string;
  url: string;
  status: "active" | "inactive";
  priceId: string;
  quantity: number;
  dryRun: boolean;
}
export interface PaymentLinkStatus {
  id: string;
  status: "active" | "inactive";
  url?: string;
  dryRun: boolean;
}
export interface StripeAdapter { create(input: Required<Omit<CreatePaymentLinkInput, "dryRun">>): Promise<PaymentLink>; get(id: string): Promise<PaymentLinkStatus>; }

function validate(input: CreatePaymentLinkInput): Required<Omit<CreatePaymentLinkInput, "dryRun">> {
  if (!input.priceId?.trim()) throw new VendorError("priceId is required");
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity < 1) throw new VendorError("quantity must be an integer of 1 or more");
  return { priceId: input.priceId, quantity, successUrl: input.successUrl ?? "", cancelUrl: input.cancelUrl ?? "" };
}

export class StripeCheckoutAdapter implements StripeAdapter {
  constructor(private readonly apiKey = process.env.STRIPE_SECRET_KEY, private readonly fetchFn: typeof fetch = fetch) {}
  private key(): string { if (!this.apiKey) throw new VendorError("Stripe key is missing. Set STRIPE_SECRET_KEY before using --live."); return this.apiKey; }
  async create(input: Required<Omit<CreatePaymentLinkInput, "dryRun">>): Promise<PaymentLink> {
    const body = new URLSearchParams({ "line_items[0][price]": input.priceId, "line_items[0][quantity]": String(input.quantity) });
    if (input.successUrl) body.set("after_completion[type]", "redirect"), body.set("after_completion[redirect][url]", input.successUrl);
    try {
      const response = await this.fetchFn("https://api.stripe.com/v1/payment_links", { method: "POST", headers: { authorization: `Bearer ${this.key()}`, "content-type": "application/x-www-form-urlencoded" }, body });
      const data = await response.json() as Record<string, unknown>;
      if (!response.ok) throw new VendorError(String((data.error as Record<string, unknown> | undefined)?.message ?? "Stripe request failed"), { status: response.status });
      return { id: String(data.id), url: String(data.url), status: data.active === false ? "inactive" : "active", priceId: input.priceId, quantity: input.quantity, dryRun: false };
    } catch (error) { if (error instanceof VendorError) throw error; throw new VendorError(`Stripe request failed: ${String(error)}`, { cause: error }); }
  }
  async get(id: string): Promise<PaymentLinkStatus> {
    try { const response = await this.fetchFn(`https://api.stripe.com/v1/payment_links/${encodeURIComponent(id)}`, { headers: { authorization: `Bearer ${this.key()}` } }); const data = await response.json() as Record<string, unknown>; if (!response.ok) throw new VendorError(String((data.error as Record<string, unknown> | undefined)?.message ?? "Stripe request failed"), {status:response.status}); return { id: String(data.id), status: data.active === false ? "inactive" : "active", url: String(data.url), dryRun:false }; } catch(error) { if(error instanceof VendorError) throw error; throw new VendorError(`Stripe request failed: ${String(error)}`, {cause:error}); }
  }
}

export async function createPaymentLink(input: CreatePaymentLinkInput, adapter = new StripeCheckoutAdapter()): Promise<PaymentLink> {
  const value = validate(input); if (input.dryRun !== false) return { id: "dry_run_payment_link", url: "https://checkout.stripe.com/pay/dry_run", status: "active", priceId:value.priceId, quantity:value.quantity, dryRun:true }; return adapter.create(value);
}
export async function getPaymentLinkStatus(id: string, options: { dryRun?: boolean; adapter?: StripeAdapter } = {}): Promise<PaymentLinkStatus> {
  if (!id.trim()) throw new VendorError("payment link id is required"); if (options.dryRun !== false) return {id, status:"active", dryRun:true}; return (options.adapter ?? new StripeCheckoutAdapter()).get(id);
}
