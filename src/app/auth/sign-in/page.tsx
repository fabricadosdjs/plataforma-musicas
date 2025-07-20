// app/auth/sign-in/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn path="/auth/sign-in" routing="path" />
    </div>
  );
}
