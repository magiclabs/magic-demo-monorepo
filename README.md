This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

Add the following environment variables to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_OIDC_PROVIDER_ID=your-magic-provider-id
NEXTAUTH_SECRET=your-next-auth-secret
NEXT_PUBLIC_MAGIC_EMBEDDED_WALLET_KEY=your-embedded-wallet-publishable-api-key
NEXT_PUBLIC_MAGIC_SERVER_WALLET_KEY=your-server-wallet-publishable-api-key
SERVER_WALLET_SECRET_KEY=your-magic-server-wallet-secret-key
```

Replace the values with your credentials from your Google and Magic developer dashboards.

## Getting Started

First, install the dependencies:

```bash
pnpm i
```

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
