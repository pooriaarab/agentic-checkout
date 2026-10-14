# agentic-checkout

Create Stripe Checkout payment links. Dry run is the default.

## Install

```bash
npm install agentic-checkout
```

## Quick start

This creates a preview. It does not call Stripe.

```bash
npx agentic-checkout create --price price_123
```

## Three uses

### CLI

Add `--live` to call Stripe. Set `STRIPE_SECRET_KEY` first.

```bash
agentic-checkout create --price price_123 --live
agentic-checkout status --id plink_123
```

### Library

```ts
import { createPaymentLink } from "agentic-checkout";
const link = await createPaymentLink({ priceId: "price_123" });
```

### MCP

```bash
npx agentic-checkout mcp
```

Use `create_payment_link` and `get_payment_link_status`. Both dry run unless `dryRun` is false.
