import { FormEvent, useState } from 'react';
import { Input } from '../ui/input';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className='flex justify-center'>
      <div className='bg-neutral-200 w-full max-w-xl p-3 rounded-xl'>
        <h1 className='text-3xl'>Create a New Poll</h1>

        <form onSubmit={onSubmit}>
          <Input
            placeholder='Question'
            type='text'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
