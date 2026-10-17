# Bhakti Bhav — Backend API Spec
## Direct UPI AutoPay Intent for Landing Page

**Document for:** Backend Team  
**Requested by:** Frontend Team  
**Date:** October 2026  
**Priority:** High

---

## 1. Context / Problem Statement

The Bhakti Bhav landing page (`/landing-page`) has a subscription UPI payment flow where users select their preferred UPI app (Google Pay, PhonePe, Paytm, etc.) and expect to be **directly taken into that app to approve the AutoPay mandate**.

### Current Behavior (Bad UX)
```
User taps "Google Pay"
→ Frontend calls POST /cashfree/subscription/create
→ Gets subscription_session_id
→ Opens Cashfree's hosted checkout page
→ User sees Cashfree-branded "UPI / Cards / Net Banking" selection screen
→ User has to manually tap "UPI" again
→ Then select Google Pay AGAIN
→ Google Pay opens
```

### Desired Behavior (Good UX)
```
User taps "Google Pay"
→ Google Pay opens immediately with AutoPay mandate
→ User enters UPI PIN, done
```

The direct deep-link (e.g. `intent://pay?...`) for each UPI app can **only be generated server-side** using Cashfree API keys via their `POST /pg/subscriptions/pay` endpoint with `channel: "intent"`.

---

## 2. New Endpoint Required

```
POST /api/v1/frontend/cashfree/subscription/pay-intent
```

**Authentication:** Bearer token required (same as all other protected endpoints)

---

## 3. Request Schema

```json
{
  "planId": "69cf557fd51b9fa7a048826c",
  "upiApp": "GPAY",
  "name": "Ramesh Sharma",
  "phone": "9876543210",
  "email": "ramesh@bhaktibhav.app",
  "returnUrl": "https://bhaktibhav.app/landing-page?subscription_id={subscription_id}",
  "couponCode": "",
  "source": "web"
}
```

### Required Fields
| Field | Type | Description |
|---|---|---|
| `planId` | string | MongoDB plan `_id` |
| `upiApp` | string | One of: `GPAY`, `PHONEPE`, `PAYTM`, `BHIM`, `CRED`, `AMAZONPAY` |
| `name` | string | Customer name |
| `phone` | string | 10-digit mobile number |

### Optional Fields
| Field | Type | Description |
|---|---|---|
| `email` | string | If omitted, backend generates `{phone}@bhaktibhav.app` |
| `returnUrl` | string | If omitted, backend uses env-configured return URL |
| `couponCode` | string | Empty string `""` or omit if no coupon |
| `source` | string | Defaults to `"web"` |

---

## 4. Backend Logic

### Step 1 — Create Cashfree Subscription
```http
POST https://api.cashfree.com/pg/subscriptions
x-api-version: 2026-01-01
x-client-id: <CASHFREE_APP_ID>
x-client-secret: <CASHFREE_SECRET_KEY>

{
  "subscription_id": "<unique-id>",
  "customer_details": {
    "customer_name": "<name>",
    "customer_email": "<email>",
    "customer_phone": "<phone>"
  },
  "plan_details": { "plan_id": "<cashfree-plan-id>" },
  "authorization_details": {
    "authorization_amount": 1,
    "authorization_amount_refund": true,
    "payment_methods": ["upi"]
  },
  "subscription_meta": { "return_url": "<returnUrl>" }
}
```

Returns: `subscription_id`, `subscription_session_id`

---

### Step 2 — Get UPI Intent Deep-Link
```http
POST https://api.cashfree.com/pg/subscriptions/pay
x-api-version: 2023-08-01 (or current version used in backend)
x-client-id: <CASHFREE_APP_ID>
x-client-secret: <CASHFREE_SECRET_KEY>

{
  "subscription_id": "<from step 1>",
  "payment_id": "<unique-payment-id>",
  "payment_amount": 1,
  "payment_type": "AUTH",
  "payment_method": {
    "upi": { "channel": "qrcode" }
  }
}
```
> 🔴 **CRITICAL CASHFREE SUBSCRIPTIONS BEHAVIOR:**
> 
> In Cashfree's Subscriptions Pay API (`POST /pg/subscriptions/pay`), the only 3 valid channels are `collect`, `link`, and `qrcode`:
> - `channel: "intent"` ❌ Returns `400 Bad Request: invalid channel`.
> - `channel: "link"` ❌ Returns `action: "link"` with `data.url: "https://payments.cashfree.com/links/..."` and **`data.payload: null`**! There is **NO** `upiIntentData` or `androidAuthAppLinks` when channel is `"link"`. Opening that URL just loads the Cashfree website.
> - `channel: "qrcode"` ✅ Returns `action: "custom"` with **`data.payload.upiIntentData.androidAuthAppLinks`** and **`iosAuthAppLinks`** populated with direct UPI intent links (`intent://...`, `gpay://...`, `phonepe://...`)!
>
> 👉 **In `cashfree-subscription.service.ts`, set `channel: 'qrcode'`.**

**Cashfree returns:**
```json
{
  "action": "custom",
  "data": {
    "url": "https://...",
    "payload": {
      "paymentType": "UPI",
      "upiIntentData": {
        "androidAuthAppLinks": {
          "GPAY":    "intent://upi/pay?pa=...#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end",
          "PHONEPE": "intent://pay?pa=...#Intent;scheme=phonepe;package=com.phonepe.app;end",
          "PAYTM":   "paytmmp://pay?pa=...&am=1...",
          "BHIM":    "intent://pay?pa=...#Intent;scheme=upi;package=in.org.npci.upiapp;end"
        },
        "iosAuthAppLinks": {
          "GPAY":    "gpay://upi/pay?pa=...&am=1...",
          "PHONEPE": "phonepe://pay?pa=..."
        }
      }
    }
  }
}
```
*(Note: Be sure to extract from `response.data?.payload?.upiIntentData?.androidAuthAppLinks`)*

---

### Step 3 — Return to Frontend

#### ✅ Success (with intentLink for direct UPI app open):
```json
{
  "success": true,
  "data": {
    "subscriptionId": "SUB_1728901234_ab12cd34",
    "intentLink": "intent://upi/pay?pa=...#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end",
    "androidAuthAppLinks": {
      "GPAY": "intent://upi/pay?...",
      "PHONEPE": "intent://pay?...",
      "PAYTM": "paytmmp://pay?..."
    },
    "iosAuthAppLinks": {
      "GPAY": "gpay://upi/pay?...",
      "PHONEPE": "phonepe://pay?..."
    },
    "subscriptionSessionId": "sess_xyz",
    "cfPaymentId": "1234567",
    "paymentId": "PAY_1728901234_ef56gh78"
  }
}
```

#### ⚠️ Intent Unavailable Fallback (frontend opens Cashfree SDK with subscriptionSessionId):
```json
{
  "success": true,
  "data": {
    "subscriptionId": "SUB_...",
    "intentLink": "",
    "androidAuthAppLinks": {},
    "iosAuthAppLinks": {},
    "subscriptionSessionId": "sess_xyz",
    "error": "intent_unavailable"
  }
}
```

---

## 5. Error Responses

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Failed to create subscription: <reason>"
}
```

---

## 6. Flow Diagram

```
User taps "Google Pay"
        │
        ▼
POST /cashfree/subscription/pay-intent
  { upiApp: "GPAY", planId, name, phone, email, returnUrl }
        │
        ▼
Backend → Cashfree POST /pg/subscriptions   (create subscription)
        │
        ▼
Backend → Cashfree POST /pg/subscriptions/pay   (get intent link)
  { payment_method: { upi: { channel: "intent" } } }
        │
        ▼
Backend → Frontend: { success: true, data: { intentLink: "intent://..." } }
        │
        ▼
Frontend: window.location.href = intentLink
        │
        ▼
    GOOGLE PAY OPENS DIRECTLY with ₹1 AutoPay Mandate
        │
        ▼
User approves with UPI PIN
        │
        ▼
Cashfree Webhook → Subscription ACTIVE
        │
        ▼
User redirected to /landing-page?subscription_id=xxx
        │
        ▼
    SUCCESS SCREEN ✅
```

---

## 7. Fallback (While Endpoint Not Live)

The frontend **gracefully falls back** — if this endpoint returns 404 or error, it automatically uses the existing `/cashfree/subscription/create` + Cashfree SDK hosted checkout. Payments still work, just with the intermediate Cashfree page.

---

## 8. Files Changed on Frontend (For Reference)

| File | What Changed |
|------|-------------|
| `src/endpoints.js` | Added `subscriptionPayIntent: 'cashfree/subscription/pay-intent'` |
| `src/api.jsx` | Added `paymentApis.subscriptionPayIntent(data)` API function |
| `src/pages/LandingPage.js` | `handleUpiAppSelect` — tries intent endpoint first, falls back to session |

---

## 9. Summary

| Item | Detail |
|------|--------|
| **New Endpoint** | `POST /cashfree/subscription/pay-intent` |
| **Cashfree API #1** | `POST /pg/subscriptions` (create sub) |
| **Cashfree API #2** | `POST /pg/subscriptions/pay` with `channel: "intent"` |
| **Key returned field** | `data.androidAuthAppLinks.{GPAY|PHONEPE|...}` |
| **DB changes** | None mandatory |
| **Fallback if not built** | Frontend auto-falls back — payments still work |

---

## 10. Debugging Checklist: If API Returns `"error": "intent_unavailable"`

If the endpoint responds with:
```json
{
  "success": true,
  "data": {
    "subscriptionId": "SUB_...",
    "intentLink": "",
    "androidAuthAppLinks": {},
    "iosAuthAppLinks": {},
    "subscriptionSessionId": "sub_session_...",
    "error": "intent_unavailable"
  }
}
```
This means Step 1 (`POST /pg/subscriptions`) **succeeded**, but Step 2 (`CashfreeSubscriptionClient.paySubscription()`) threw an error and triggered the fallback.

### What Backend Team Needs to Check:
1. **Log the exact error:** In `CashfreeSubscriptionService.createPayIntent()`, check the `catch` block around `paySubscription()` and console log / logger `error.response?.data` to see Cashfree's exact error message.
2. **Channel value:** In `payment_method.upi.channel`, test `"link"` instead of `"intent"`. Cashfree Subscriptions API expects `"link"` for generating intent links; `"intent"` may return a 400 Bad Request error.
3. **Response nesting:** Cashfree wraps the response as:
   `res.data.payload.upiIntentData.androidAuthAppLinks` (or `res.data.data.payload...`).
   Ensure the service is not reading `res.androidAuthAppLinks` directly.
4. **Cashfree Merchant Permissions:** Verify on the Cashfree Merchant Dashboard whether UPI AutoPay Intent is activated for the merchant account.

---

## 11. Exact Backend Implementation Snippet (TypeScript / NestJS)

If Cashfree webpage is opening instead of Google Pay, it is because **`intentLink` was set to `response.data.url`** (which is `https://payments.cashfree.com/...`). 

👉 **Replace the return mapping in `cashfree-subscription.service.ts` with this exact logic:**

```typescript
// After calling Cashfree POST /pg/subscriptions/pay:
const cfResponseData = payResponse?.data || {};
const cfPayload = cfResponseData?.payload || {};
const upiIntentData = cfPayload?.upiIntentData || {};
const androidLinks = upiIntentData?.androidAuthAppLinks || {};
const iosLinks = upiIntentData?.iosAuthAppLinks || {};

// 1. Pick the exact app link (e.g. GPAY, PHONEPE)
// 2. OR pick the universal DEFAULT link (upi://mandate?...)
// 3. NEVER set intentLink to cfResponseData.url (that is Cashfree's hosted webpage!)
const upiKey = (body.upiApp || '').toUpperCase();
const directNativeLink = 
  androidLinks[upiKey] || 
  androidLinks[body.upiApp] || 
  androidLinks['DEFAULT'] || 
  androidLinks['default'] || 
  iosLinks[upiKey] || 
  '';

return {
  success: true,
  data: {
    subscriptionId: subscription.subscription_id,
    intentLink: directNativeLink, // Native deep link only (upi:// or intent://). Empty if unavailable.
    androidAuthAppLinks: androidLinks,
    iosAuthAppLinks: iosLinks,
    subscriptionSessionId: subscription.subscription_session_id,
  }
};
```

