# Meta OAuth: “Feature unavailable” troubleshooting

If the Facebook popup displays **“Facebook Login is currently unavailable for
this app as we are updating additional details for this app”**, the request has
reached Meta. The failure happens before Meta redirects to Growdex, so changing
the frontend popup or repeatedly reloading it will not fix the problem. An
administrator of the Meta app must clear the app-level restriction or finish
its configuration.

## Who needs to fix it?

When this happens while a customer is clicking **Connect** in Growdex, the
customer does **not** need to create or configure a Meta developer app. Growdex
owns the OAuth app identified by the request's `client_id`, so this is primarily
a Growdex integration incident. Ask the customer to close the popup and send
Growdex Support the screenshot, the approximate failure time and timezone, and
the email address on their Growdex account. They should not send passwords,
access tokens, authorization codes, or the full OAuth URL.

The Growdex engineer or Meta app administrator should then follow the recovery
checklist below. The customer only needs to take further action if Growdex has
confirmed that the app is healthy and the problem is specific to their Meta
account—for example, accepting a Business Manager invitation or granting the
required business permissions.

## Recovery checklist

1. As a Growdex Meta app administrator, open the [Meta App
   Dashboard](https://developers.facebook.com/apps/) and select
   the **same app ID used by the Growdex backend**. Check the dashboard banner,
   **Alerts**, and **Required actions** first. Complete any requested data-use
   checkup, business verification, privacy-policy update, permission review, or
   terms acceptance. Meta may disable login while one of these is outstanding.
2. Check that the app is **Live**, rather than in Development mode. If it must
   remain in Development mode, add every tester under **App roles** and have
   them accept the invitation. A normal Facebook account cannot authorize a
   development-mode app.
3. Confirm that **Facebook Login for Business** (or the Facebook Login product
   used by the backend) is added and enabled. In its settings:
   - enable client and web OAuth login;
   - add the backend's *exact* callback URL to **Valid OAuth Redirect URIs**;
   - add the production frontend/backend domains to **App domains** and allowed
     domains where requested; and
   - ensure the app’s website URL, privacy-policy URL, terms URL, contact email,
     category, and app icon are present and publicly reachable.
4. Under **Permissions and Features**, verify that every scope requested by
   `GET /auth/meta` has the required access level. For users without an app
   role, permissions that require Advanced Access must be approved through App
   Review. Remove any obsolete or unapproved scopes from the backend request.
5. Verify backend credentials and URLs in the deployed environment. The app ID
   and secret must belong to the dashboard app inspected above, and the redirect
   URI sent in the authorization request must exactly match the allow-listed
   URI (scheme, host, path, port, and trailing slash all matter). Never expose
   the app secret through a `NEXT_PUBLIC_*` variable or frontend code.
6. After saving Meta settings, wait a few minutes. First retry with a Growdex
   test account that has the appropriate app role. Once that succeeds, retry
   with a non-role account to confirm that production customers can connect.

Meta’s official references are the [app release
guide](https://developers.facebook.com/docs/development/release/), [Facebook
Login for Business](https://developers.facebook.com/docs/facebook-login/facebook-login-for-business/),
and [App Review documentation](https://developers.facebook.com/docs/app-review/).

## Growdex-specific verification

Growdex starts the flow by opening the backend endpoint below; the backend—not
this Next.js app—constructs the Meta authorization URL:

```text
GET {NEXT_PUBLIC_BACKEND_API_URL}/auth/meta
```

Before opening that endpoint, the frontend makes an authenticated onboarding
status request. This lets the shared API client refresh an expired Growdex
session and prevents the OAuth popup from displaying a raw
`{"message":"Unauthorized","statusCode":401}` response. If preflight still
returns 401, the user is sent back through Growdex sign-in instead of starting
Meta authorization.

Use the browser Network panel (with **Preserve log** enabled) to inspect its
redirect chain. Record these values from the final `facebook.com/.../dialog/oauth`
request and compare them with the Meta dashboard and backend deployment:

- `client_id`: must be the expected Meta app ID;
- `redirect_uri`: must exactly match a Valid OAuth Redirect URI; and
- requested scopes: must be enabled and approved for the account being tested.

Do not paste the app secret, access tokens, authorization codes, or the complete
OAuth URL into an issue or chat. The URL may contain state or other sensitive
values.

The Growdex callback page only runs after Meta redirects back, and the frontend
accepts completion messages only from the frontend origin or configured backend
origin. Therefore, if the Meta-branded error page remains open and no callback
request appears in the Network panel, resolve the Meta dashboard/backend
configuration before debugging the callback page.

## If the checklist does not clear it

The Growdex Meta app administrator should use **Support** in the Meta App
Dashboard and include the app ID, the timestamp and timezone of a failed
attempt, the affected Facebook account ID, and a screenshot. Do not include the
app secret or tokens. This particular page can also represent an enforcement or
staged Meta-side restriction that application code cannot override.
