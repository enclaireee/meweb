import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// "/" has no page: send the visitor to their language. Everything else is static.
export function proxy(request: NextRequest) {
  const id = /^id\b/i.test(request.headers.get('accept-language') ?? '');
  return NextResponse.redirect(new URL(id ? '/id' : '/en', request.url));
}

export const config = { matcher: '/' };
