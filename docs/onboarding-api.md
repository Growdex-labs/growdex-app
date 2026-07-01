# Onboarding 2.0 — Backend API Requirements

This document lists the data captured by the new onboarding flow (`app/(dashboard)/onboarding`)
and the backend changes needed to persist it. Fields are grouped by step.

**Status legend**
- ✅ **Wired** — already persisted by an existing endpoint.
- 🆕 **Needs backend** — captured in the UI today as local state only; no endpoint yet.

The frontend `FormDataProps` shape lives in `app/(dashboard)/onboarding/page.tsx`.

---

## Step 1 — Profile

Title: *Manage Your Advertising in One Place*

| UI label | Field key | Type | Required | Status | Notes |
|---|---|---|---|---|---|
| Your name | `firstName` | string | yes | ✅ | |
| Last name | `lastName` | string | yes | ✅ | |
| Organization name | `organizationName` | string | yes | ✅ | Shows a "Required" badge until filled |
| Industry | `industry` | string | no | 🆕 | Free text today; could become an enum |
| Monthly budget | `monthlyBudget` | string | no | 🆕 | Free text today (e.g. `"$1,000 - $5,000"`) |
| — | `organizationSize` | number | no | ✅ | No longer has an input in the new design, but still sent to keep the existing contract intact |

### Existing endpoint (today)

```
POST /users/onboarding
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Doe Junior",
  "organizationSize": 0
}
```

### Proposed extension

Accept the two new fields on the same endpoint:

```
POST /users/onboarding

{
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Doe Junior",
  "organizationSize": 0,
  "industry": "Real estate",      // NEW, optional
  "monthlyBudget": "1000-5000"    // NEW, optional
}
```

---

## Step 2 — Business

Title: *Setup your business*

| UI label | Field key | Type | Required | Status | Notes |
|---|---|---|---|---|---|
| Business Name | `businessName` | string | no | 🆕 | Legal business name |
| Website | `website` | string (URL) | no | 🆕 | Validate as URL |
| Monthly Advertising Budget | `advertisingBudget` | string (enum) | no | 🆕 | Dropdown — see allowed values below |
| Industry | `industry` | string | no | 🆕 | Shared with Step 1's `industry` |
| Country | `country` | string | no | 🆕 | Free text today; could become ISO country code |

**`advertisingBudget` allowed values** (from `step-two.tsx`):

```
"0-500"        // $0 - $500 / month
"500-1000"     // $500 - $1,000 / month
"1000-5000"    // $1,000 - $5,000 / month
"5000-10000"   // $5,000 - $10,000 / month
"10000+"       // $10,000+ / month
```

### Proposed endpoint (new)

```
POST /users/onboarding/business

{
  "businessName": "Legal Business Ltd",
  "website": "https://legalbusiness.com",
  "advertisingBudget": "1000-5000",
  "industry": "Real estate",
  "country": "Spain"
}
```

---

## Step 3 — Marketing Goals

Title: *Set your marketing goals*

| UI label | Field key | Type | Required | Status | Notes |
|---|---|---|---|---|---|
| Goal cards (multi-select) | `goals` | string[] | no | 🆕 | Array of goal IDs (see below) |
| "Tell Growdex what you want to achieve" | `customGoal` | string | no | 🆕 | Free-text goal |

**`goals` allowed IDs** (from `step-three.tsx`):

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

## Step 4 — Connect Social Accounts

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
    "organizationSize": 0,
    "industry": "Real estate",
    "monthlyBudget": "1000-5000"
  },
  "business": {
    "businessName": "Legal Business Ltd",
    "website": "https://legalbusiness.com",
    "advertisingBudget": "1000-5000",
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
- [ ] Add `saveBusinessInfo()` → `POST /users/onboarding/business`, call it on Step 2 "Next".
- [ ] Add `saveGoals()` → `POST /users/onboarding/goals`, call it on Step 3 "Next".
- [ ] Extend `fetchOnboardingStatus` to read `profile` / `business` / `goals` and pre-fill `formData`.
- [ ] (Optional) Wire "Notify me" / "Request a new integration" to `integration-interest`.

### Open questions for the backend team
1. Should `industry` be free text or a fixed enum? It currently appears on both Step 1 and Step 2 — confirm it's a single shared value.
2. Should `country` be a free-text string or an ISO 3166 country code?
3. Should `monthlyBudget` (Step 1) and `advertisingBudget` (Step 2) be merged into one field? They overlap conceptually.
4. Is there still a need for `organizationSize` now that the input was removed from the design?
