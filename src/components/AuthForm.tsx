import { SignInButton } from '@clerk/clerk-react';

export default function AuthForm() {
  return (
    <div className='flex flex-col gap-8 w-96 mx-auto'>
      <p>Log in to track your polls</p>
      <SignInButton mode='modal'>
        <button className='bg-dark dark:bg-light text-light dark:text-dark text-sm px-4 py-2 rounded-md border-2'>
          Sign in
        </button>
      </SignInButton>
    </div>
  );
}
