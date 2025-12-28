import { Link } from 'react-router';

export default function PollNotFound() {
  return (
    <div className='flex items-center flex-col'>
      <h1 className='text-2xl text-red-600'>No poll found with given ID.</h1>
      <h3 className='text-lg'>
        It may have been deleted or never existed at all.{' '}
        <Link to='/' className='text-blue-500 underline'>
          Return home?
        </Link>
      </h3>
    </div>
  );
}
