import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/v1')) {
        const destinationUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://lms-production-e985.up.railway.app');

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('X-Forwarded-Proto', 'https');
        requestHeaders.set('host', 'lms-production-e985.up.railway.app');
        requestHeaders.set('origin', 'https://lms-production-e985.up.railway.app');
        requestHeaders.set('referer', 'https://lms-production-e985.up.railway.app/');

        return NextResponse.rewrite(destinationUrl, {
            request: {
                headers: requestHeaders,
            },
        });
    }
}

export const config = {
    matcher: '/api/v1/:path*',
};
