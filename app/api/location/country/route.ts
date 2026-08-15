import { NextResponse } from 'next/server';
import { countryNameForCode } from '@/lib/onboarding-country';

/**
 * Returns only the visitor's country, never their IP address or precise
 * location. Vercel provides the first header; Cloudflare is supported when
 * its visitor-location header transform is enabled.
 */
export async function GET(request: Request) {
  const country = countryNameForCode(
    request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry'),
  );

  return NextResponse.json(
    { country },
    {
      headers: {
        'Cache-Control': 'private, no-store',
        Vary: 'X-Vercel-IP-Country, CF-IPCountry',
      },
    },
  );
}
