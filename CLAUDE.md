# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # start dev server (http://localhost:3000)
npm run build     # production build
npm run lint      # ESLint
npx tsc --noEmit  # type-check only (no emit, skips next-env.d.ts)
```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `KITCHEN_PIN` | PIN for authentication (checked server-side in `app/actions.ts`) |
| `NEXT_PUBLIC_RESTAURANT` | Restaurant identifier used in Supabase row filter |
| `NEXT_PUBLIC_RESTAURANT_NAME` | Display name shown in POS header |
| `NEXT_PUBLIC_PRINTER_KITCHEN` | QZ Tray printer name for kitchen tickets |
| `NEXT_PUBLIC_PRINTER_CASHIER` | QZ Tray printer name for cashier receipts |
| `NEXT_PUBLIC_LOCALE` | Default locale (`en`/`fr`/`nl`) — overridden at runtime via Settings |
| `NEXT_PUBLIC_CURRENCY` | Currency symbol for price display |
| `NEXT_PUBLIC_VAT_RATE` | VAT rate as decimal (e.g. `0.06`) |

## Architecture Overview

Single-page app. One view mounted at a time. Auth state and active view are persisted in `localStorage`.

### View Routing (`app/page.tsx`)

```text
App
├─ LoginView          (if !authenticated)
└─ SettingsProvider   (wraps everything once authenticated)
   ├─ NotificationSubscriber  (headless, always mounted)
   └─ [active view]
      ├─ KitchenView     view='kitchen'
      ├─ CounterView     view='counter'
      ├─ CompletedView   view='completed'
      ├─ POSView         view='pos'
      └─ SettingsView    view='settings'
```

`switchView` saves view to `localStorage` (except `'settings'`). Going to settings saves `prevView` so back navigation works.

### Authentication

`LoginView` calls `app/actions.ts → verifyPin()` (Server Action). Compares PIN against `KITCHEN_PIN` env var. On success, sets `localStorage.ops_auth = '1'`.

### Notification System

**Problem it solves**: Views unmount when you switch away — a subscription inside KitchenView would miss orders while POS is active.

**Solution**: `components/NotificationSubscriber.tsx` is headless (returns null) and always mounted after auth. It holds two `useOrders` subscriptions:

- `['pending','preparing','ready']` — fires sound + print on any new customer order
- `['ready']` — fires when an order becomes ready (alerts counter staff)

Sound respects `soundEnabled` from `SettingsContext`. Print always fires.

**`SESSION_START`** (`hooks/useOrders.ts`): module-level `const SESSION_START = new Date().toISOString()`. During initial load, orders with `created_at < SESSION_START` are pre-marked as notified so they don't re-fire on mount. Orders created after the page loaded always trigger.

### Supabase Real-time (`hooks/useOrders.ts`)

Subscribes to `postgres_changes` on the `orders` table filtered by `restaurant = NEXT_PUBLIC_RESTAURANT`. On INSERT, fetches full order with items. Maintains `notifiedIds` ref to prevent duplicate callbacks.

Visible statuses are passed as an array parameter. Each subscriber is independent — multiple components can call `useOrders` with different status filters.

### i18n System

**`lib/i18n.ts`** — custom, no external library:

- `Locale` type: `'en' | 'fr' | 'nl'`
- `LOCALES`: `['en', 'fr', 'nl']`
- `LOCALE_CODE`: maps locale to BCP-47 for `toLocaleString` (e.g. `en → 'en-GB'`, `fr → 'fr-BE'`)
- `t(key, locale)`: returns translation string
- `fill(template, vars)`: replaces `{varName}` placeholders

**`components/SettingsContext.tsx`** — React context + localStorage persistence:

- `ops_locale` key: active locale (default: `NEXT_PUBLIC_LOCALE` env var then `'en'`)
- `ops_sound` key: sound enabled boolean
- Exports `useSettings()` (locale, setLocale, soundEnabled, setSoundEnabled)
- Exports `useTrans()` (bound `t(key)`, `fill(str, vars)`, `locale`)

**`components/LocaleContext.tsx`** — thin re-export shim so old `import { useTrans } from '@/components/LocaleContext'` imports still work.

All views use `useTrans()`. Every user-visible string is translated. Kitchen, counter, counter, completed, POS — all translate.

### Print Pipeline

```text
SettingsContext (locale)
  → NotificationSubscriber
    → usePrinter (hooks/usePrinter.ts)
      → kitchenTicket / cashierReceipt (lib/escpos.ts)
        → QZ Tray WebSocket (window.qz)
```

`lib/escpos.ts` generates ESC/POS byte arrays. Both `kitchenTicket(order, locale)` and `cashierReceipt(order, restaurantName, locale)` accept a locale and use `t()` + `fill()` for all label strings, and `LOCALE_CODE[locale]` for date formatting.

`hooks/usePrinter.ts` connects to QZ Tray via `window.qz`. Guards with `qz.websocket.isActive()` so multiple instances don't double-connect.

Reprint from views: `printKitchen(o, locale); printCashier(o, locale)` — locale comes from `useTrans()`.

### POS (`components/pos/`)

`POSView` → `POSHeader` + `MenuGrid` + `OrderPanel` + `CheckoutSheet`

- `MenuGrid` fetches menu items via `useMenuItems(locale)` — reloads when locale changes
- `useMenuItems` queries `menu_items` + `menu_categories` tables with locale joins (`menu_items_locales`, `menu_categories_locales` keyed by `_locale` and `_parent_id`)
- Cart state lives in `hooks/useCart.ts`
- Checkout creates an order in Supabase; the `NotificationSubscriber` picks it up via real-time and triggers kitchen print

### Settings (`components/SettingsView.tsx`)

Full-page settings UI. Language picker (EN/FR/NL cards) + sound toggle. Receives `onBack` prop to return to previous view.

Accessed via gear icon in `NavTabs` (kitchen/counter/completed) or `POSHeader` (POS view).

## Key Files Quick Reference

| File | Role |
| --- | --- |
| `app/page.tsx` | Root: auth, view routing, SettingsProvider |
| `app/actions.ts` | Server Action: PIN verification |
| `components/NotificationSubscriber.tsx` | Always-on sound + print trigger |
| `components/SettingsContext.tsx` | Locale + sound settings, context + localStorage |
| `components/LocaleContext.tsx` | Re-export shim for SettingsContext |
| `components/NavTabs.tsx` | Tab bar (kitchen/counter/completed/pos) + settings + fullscreen |
| `hooks/useOrders.ts` | Supabase real-time subscription; SESSION_START guard |
| `hooks/usePrinter.ts` | QZ Tray print wrappers |
| `hooks/useMenuItems.ts` | Menu fetch with locale joins |
| `hooks/useCart.ts` | POS cart state |
| `lib/escpos.ts` | ESC/POS ticket generators |
| `lib/i18n.ts` | Translation dictionary + t() + fill() |
| `lib/vat.ts` | VAT calculation helpers |
| `lib/payload-types.ts` | Supabase row types |
| `types/order.ts` | Order + OrderItem types used throughout |
