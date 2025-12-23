import { UserButton } from '@clerk/clerk-react';
import { Link, Outlet } from 'react-router';

export default function Layout() {
  return (
    <>
      <header className='sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center'>
        <Link to='/'>AdnPolls</Link>
        <UserButton />
      </header>
      <main className='p-8 flex flex-col gap-16'>
        <Outlet />
      </main>
    </>
  );
}
