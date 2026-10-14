# agentic-checkout

[![npm version](https://img.shields.io/npm/v/agentic-checkout)](https://www.npmjs.com/package/agentic-checkout)
[![Downloads/month](https://img.shields.io/npm/dm/agentic-checkout)](https://www.npmjs.com/package/agentic-checkout)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

[Package](https://www.npmjs.com/package/agentic-checkout) · [Quickstart](#preview-your-first-payment-link) · [Source](https://github.com/pooriaarab/agentic-checkout)

agentic-checkout is an open-source Stripe Payment Links wrapper for Node.js developers, with dry-run previews, command-line tools, and agent tools.

## Install

```sh
npm install agentic-checkout
```

Node.js 18 or later is required. TypeScript declarations are included, with two direct runtime dependencies.

## Preview your first payment link

Save this as `checkout-demo.mjs`. No key or environment variables are required for previews.

```js
import { createPaymentLink, getPaymentLinkStatus } from "agentic-checkout";

const link = await createPaymentLink({ priceId: "price_example", quantity: 1 });
console.log(link.id, link.dryRun);
const status = await getPaymentLinkStatus(link.id);
console.log(status.status, status.dryRun);
```

```sh
node checkout-demo.mjs
```

Success prints `dry_run_payment_link true` and `active true`. The URL and active status are simulated. No payable link is created or retrieved.

For live calls, export `STRIPE_SECRET_KEY` and use a real Stripe Price ID.
Pass `dryRun: false` to SDK helpers or MCP tools, or add `--live` to CLI requests.
The package does not load `.env` files. Export variables or load them in your application.

## Features and coverage

| Integration | Status | Source behavior |
| --- | --- | --- |
| Stripe Payment Links | Implemented; live verification pending | Create one line item and retrieve link activity |

One Stripe adapter exists. HTTP tests use fixture responses; zero integrations were credential-checked for this rewrite.

- **SDK:** `createPaymentLink`, `getPaymentLinkStatus`, `StripeCheckoutAdapter`, and `VendorError`.
- **CLI:** `create --price <id> [--quantity <n>] [--live]` and `status --id <id> [--live]`.
- **Help:** `--help` and `--version`; see the CLI invocation limit below.
- **Model Context Protocol (MCP):** `create_payment_link` and `get_payment_link_status` over stdio.
- **Completion redirect:** SDK and MCP creation accept `successUrl` for Stripe's after-completion redirect.

Start MCP with `npx agentic-checkout-mcp`. The main CLI has no `mcp` subcommand. Helper functions default to dry runs. Direct adapter methods make live requests.

## Behavior limits

Symlinked CLI bin paths can exit without output. Invoke `node node_modules/agentic-checkout/dist/cli.js` directly.
Status means the link is active or inactive. It does not confirm a payment or fulfill an order.
`cancelUrl` is accepted by the SDK input but is never sent to Stripe.
The CLI does not forward completion redirect URLs; use the SDK or MCP for `successUrl`.
Creation supports one existing Price ID and a positive integer quantity. It does not create products or prices.
There are no webhooks, refunds, cancellation helpers, automatic retries, request timeouts, or idempotency keys.
The package does not pin a Stripe API version. Your Stripe account determines the default API version.
No managed payment service, dashboard, or Worker handler is included.

## Links and status

- [Stripe Payment Links creation API](https://docs.stripe.com/api/payment_links/payment_links/create) for line items and completion redirects.
- [Report a problem](https://github.com/pooriaarab/agentic-checkout/issues). Version 0.1.1 can change before 1.0.

No separate public docs site is configured. Public case studies are not published in this repository.
For contributions, run `npm ci`, `npm run build`, `npm run typecheck`, and `npm test`.

## License

MIT. See the [license text](https://opensource.org/license/mit).
