This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

Add the following environment variables to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_OIDC_PROVIDER_ID=your-magic-provider-id
MAGIC_API_KEY=your-magic-secret-key
NEXTAUTH_SECRET=your-next-auth-secret
```

Replace the values with your credentials from Google and GitHub developer consoles.

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
