import { SignInButton, UserButton } from '@clerk/clerk-react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Link, Outlet, useNavigate } from 'react-router';
import { List } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <>
      <header className='sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center'>
        <Link to='/'>AdnPolls</Link>
        <Authenticated>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label='My Polls'
                labelIcon={<List size={16} />}
                onClick={() => navigate('/my-polls')}
              />
            </UserButton.MenuItems>
          </UserButton>
        </Authenticated>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
      </header>
      <main className='p-8 flex flex-col gap-16'>
        <Outlet />
      </main>
    </>
  );
}
