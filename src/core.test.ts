import { describe, expect, it } from "vitest";
import { createPaymentLink, getPaymentLinkStatus, StripeCheckoutAdapter } from "./core.js";
describe("checkout", () => {
  it("creates a dry run by default", async () => expect(await createPaymentLink({priceId:"price_fixture"})).toMatchObject({dryRun:true,priceId:"price_fixture"}));
  it("reads dry run status by default", async () => expect(await getPaymentLinkStatus("plink_fixture")).toEqual({id:"plink_fixture",status:"active",dryRun:true}));
  it("uses fixture response for live adapter", async () => { const fetchFn = async (url: string | URL | Request) => { expect(String(url)).toBe("https://api.stripe.com/v1/payment_links"); return new Response(JSON.stringify({id:"plink_fixture",url:"https://checkout.stripe.com/pay/test",active:true}),{status:200}); }; const adapter=new StripeCheckoutAdapter("sk_fixture",fetchFn as typeof fetch); expect(await createPaymentLink({priceId:"price_fixture",dryRun:false},adapter)).toMatchObject({id:"plink_fixture",dryRun:false}); });
  it("reports a missing key", async () => await expect(createPaymentLink({priceId:"price_fixture",dryRun:false},new StripeCheckoutAdapter(undefined,fetch))).rejects.toThrow("Stripe key is missing"));
  it("preserves vendor errors", async () => { const fetchFn=async()=>new Response(JSON.stringify({error:{message:"fixture declined"}}),{status:402}); const adapter=new StripeCheckoutAdapter("sk_fixture",fetchFn as typeof fetch); await expect(createPaymentLink({priceId:"price_fixture",dryRun:false},adapter)).rejects.toThrow("fixture declined"); });
});
