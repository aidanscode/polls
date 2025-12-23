'use client';

import { Authenticated, Unauthenticated } from 'convex/react';
import { UserButton } from '@clerk/clerk-react';
import AuthForm from './components/AuthForm';

export default function App() {
  return (
    <>
      <header className='sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center'>
        AdnPolls
        <UserButton />
      </header>
      <main className='p-8 flex flex-col gap-16'>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <AuthForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function Content() {
  return <p>Hello, world</p>;
}
