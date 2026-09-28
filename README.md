# SRM Campus Marketplace

A secure, campus-exclusive marketplace built with Next.js App Router and Supabase.

## Features
- **Campus Exclusive**: Only users with `@srmist.edu.in` emails can sign up.
- **Privacy First**: Room numbers are kept private and only revealed to a buyer when the seller explicitly grants consent.
- **Real-time Chat**: Built-in messaging system for buyers and sellers to negotiate.
- **Secure File Storage**: Photos are uploaded directly to Supabase Storage with size and type validation.

## Prerequisites
- Node.js 18.x or later
- A [Supabase](https://supabase.com) project

## Supabase Setup
1. Create a new project in the Supabase Dashboard.
2. Go to **Authentication** -> **URL Configuration** and add your production URL to the "Site URL" and "Redirect URLs".
3. Go to **SQL Editor** and run the initial migration script: `supabase/migrations/20240101000000_init.sql`.
4. (Optional) To populate demo data, sign up as a user via the app, then run `seed.sql` in the SQL Editor.

## Environment Variables
Create a `.env.local` file (or configure these in your Vercel project settings):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Note**: Never expose your `SUPABASE_SERVICE_ROLE_KEY` in the browser or in Vercel environment variables prefixing with `NEXT_PUBLIC_`. This app does not require the service role key.

## Local Development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Vercel Deployment
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the project in Vercel.
3. In the "Environment Variables" section, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Click **Deploy**. Vercel will automatically run `npm run build`.

## Security Features
- **Row Level Security (RLS)**: Enforced on all tables.
- **Server Actions**: All form inputs are validated securely on the server using Zod.
- **RPC Functions**: Secure database operations are wrapped in PL/pgSQL functions running as `SECURITY DEFINER` when necessary, with strict ownership checks.
