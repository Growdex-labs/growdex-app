# Onboarding 2.0 — Backend API Requirements

This document lists the data captured by the new onboarding flow (`app/(dashboard)/onboarding`)
and the backend changes needed to persist it. Fields are grouped by step.

**Status legend**
- ✅ **Wired** — already persisted by an existing endpoint.
- 🆕 **Needs backend** — captured in the UI today as local state only; no endpoint yet.

The frontend `FormDataProps` shape lives in `app/(dashboard)/onboarding/page.tsx`.

---

## Step 1 — Profile and business

Title: *Manage Your Advertising in One Place*

| UI label | Field key | Type | Required | Status | Notes |
|---|---|---|---|---|---|
| Your name | `firstName` | string | yes | ✅ | |
| Last name | `lastName` | string | yes | ✅ | |
| Organization name | `organizationName` | string | yes | ✅ | Shows a "Required" badge until filled; also sent as `businessName` |
| Website | `website` | string (URL) | no | 🆕 | Validate as URL |
| Country | `country` | string | no | ✅ | Automatically pre-filled from the visitor's country, but remains editable |
| Industry | `industry` | string (enum) | no | 🆕 | Dropdown |
| Monthly advertising budget | `monthlyBudget` | string (enum) | no | ✅ | Dropdown — saved with the currency used to display it |
| Company size | `organizationSize` | numeric string | no | ✅ | Dropdown — each band is sent as the numeric string below; omitted when unanswered |

The step saves to two endpoints in turn: the profile fields to `POST /users/onboarding`, then the
business fields to `POST /users/onboarding/business`. A failure on either one keeps the customer on
this step.

### Existing endpoint (today)

```
POST /users/onboarding
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Doe Junior",
  "organizationSize": "200"
}
```

**`organizationSize` allowed values** (from `components/options.ts`):

```
"1"      // Just me
"10"     // 2 - 10 people
"25"     // 11 - 25 people
"50"     // 26 - 50 people
"200"    // 51 - 200 people
"500"    // 201 - 500 people
"1000"   // 500+ people
```

### Proposed extension

Accept the two new fields on the same endpoint:

```
POST /users/onboarding

{
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Doe Junior",
  "organizationSize": "200",
  "industry": "Real estate",      // NEW, optional
  "monthlyBudget": "1000-5000"    // NEW, optional
}
```

**`advertisingBudget` allowed values** (from `components/options.ts`):

```
"0-500"        // $0 - $499 / month
"500-1000"     // $500 - $999 / month
"1000-5000"    // $1,000 - $4,999 / month
"5000-10000"   // $5,000 - $9,999 / month
"10000+"       // $10,000+ / month
```

For Nigeria, the form uses naira-specific ranges and sends `advertisingBudgetCurrency: "NGN"`:

```
"0-100000"          // ₦0 - ₦99,999 / month
"100000-500000"     // ₦100,000 - ₦499,999 / month
"500000-1000000"    // ₦500,000 - ₦999,999 / month
"1000000-5000000"   // ₦1,000,000 - ₦4,999,999 / month
"5000000+"          // ₦5,000,000+ / month
```

### Business endpoint (proposed)

```
POST /users/onboarding/business

{
  "businessName": "Doe Junior",
  "website": "https://legalbusiness.com",
  "advertisingBudget": "1000-5000",
  "advertisingBudgetCurrency": "USD",
  "industry": "Real estate",
  "country": "Spain"
}
```

---

## Step 2 — Marketing Goals

Title: *Set your marketing goals*

| UI label | Field key | Type | Required | Status | Notes |
|---|---|---|---|---|---|
| Goal cards (multi-select) | `goals` | string[] | no | 🆕 | Array of goal IDs (see below) |
| "Tell Growdex what you want to achieve" | `customGoal` | string | no | 🆕 | Free-text goal |

**`goals` allowed IDs** (from `step-goals.tsx`):

```
"leads"      // Generate Leads
"sales"      // Generate Sales
"traffic"    // Drive Traffic
"awareness"  // Build Awareness
```

### Proposed endpoint (new)

```
POST /users/onboarding/goals

{
  "goals": ["leads", "traffic"],
  "customGoal": "I want more leads for my real estate company in Lagos."
}
```

---

## Step 3 — Connect Social Accounts

Title: *Connect your social accounts*

Already fully backed by existing endpoints — no new fields.

| Action | Endpoint | Status |
|---|---|---|
| Start OAuth | `GET /auth/:platform` (`meta` \| `tiktok`) | ✅ |
| Read connection + assets | `GET /users/onboarding/status` | ✅ |
| Set primary Meta asset | `POST /users/onboarding/assets/meta/primary` | ✅ |
| Disconnect | `POST /users/onboarding/disconnect/:platform` | ✅ |

Coming-soon platforms (LinkedIn, Google, X, Snapchat) are display-only; the "Notify me" and
"Request a new integration" buttons are **not yet wired**. If we want to capture interest,
add:

```
POST /users/onboarding/integration-interest

{
  "platform": "linkedin",        // or free text for "Request a new integration"
  "type": "notify" | "request"
}
```

---

## Status response — proposed additions

`GET /users/onboarding/status` currently returns the social-account shape
(`SocialAccountSetupProps`). To rehydrate the new steps on return visits, it should also return
the persisted profile/business/goal data so the forms can pre-fill:

```jsonc
{
  // existing
  "meta":   { "connected": true,  "assets": [ ... ] },
  "tiktok": { "connected": false, "assets": [] },

  // NEW — for rehydration
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "organizationName": "Doe Junior",
    "organizationSize": "200",
    "industry": "Real estate",
    "monthlyBudget": "1000-5000"
  },
  "business": {
    "businessName": "Legal Business Ltd",
    "website": "https://legalbusiness.com",
    "advertisingBudget": "1000-5000",
    "advertisingBudgetCurrency": "USD",
    "industry": "Real estate",
    "country": "Spain"
  },
  "goals": {
    "selected": ["leads", "traffic"],
    "custom": "I want more leads for my real estate company in Lagos."
  }
}
```

---

## Frontend integration checklist

Once the endpoints exist, wire them in `lib/onboarding.ts` and `app/(dashboard)/onboarding/page.tsx`:

- [ ] Extend `savePersonalInfo` payload with `industry`, `monthlyBudget`.
- [ ] Add `saveBusinessInfo()` → `POST /users/onboarding/business`, call it on Step 1 "Next".
- [ ] Add `saveGoals()` → `POST /users/onboarding/goals`, call it on Step 2 "Next".
- [ ] Extend `fetchOnboardingStatus` to read `profile` / `business` / `goals` and pre-fill `formData`.
- [ ] (Optional) Wire "Notify me" / "Request a new integration" to `integration-interest`.

### Open questions for the backend team
1. Should `industry` be free text or a fixed enum?
2. Should `country` be a free-text string or an ISO 3166 country code?
3. `monthlyBudget` and `advertisingBudget` now always carry the same answer, and `organizationName`
   doubles as `businessName`. Can the duplicates be collapsed server-side?
