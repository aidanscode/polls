import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center'>
      <h1 className='text-2xl'>Page Not Found</h1>
      <p>
        <Link to='/' className='text-blue-500 underline'>
          Return home?
        </Link>
      </p>
    </div>
  );
}
