import { FormEvent, useState } from 'react';
import { Input } from '../ui/input';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '../ui/field';
import * as z from 'zod';
import { Button } from '../ui/button';
import { $ZodErrorTree } from 'zod/v4/core';

const newPoll = z.object({
  question: z.string().trim().min(1, 'You must specify a question!'),
  options: z
    .array(z.string().trim().min(1, 'Option must not be empty!'))
    .min(1, 'You must specify at least one option!')
});
type NewPoll = z.infer<typeof newPoll>;

const getErrors = (
  error: $ZodErrorTree<NewPoll> | null,
  field: keyof NewPoll,
  index?: number
): { message: string }[] => {
  if (!error) return [];

  if (error.properties) {
    const p = error.properties;
    const fieldErrors = p[field];
    if (!fieldErrors) return [];

    if (index !== undefined) {
      if ('items' in fieldErrors && fieldErrors.items !== undefined) {
        const items = fieldErrors.items;
        return index in items
          ? items[index].errors.map((str) => ({ message: str }))
          : [];
      } else {
        return [];
      }
    } else {
      return fieldErrors.errors.map((str) => ({
        message: str
      }));
    }
  }

  return [];
};

const hasError = (
  error: $ZodErrorTree<NewPoll> | null,
  field: keyof NewPoll,
  index?: number
): boolean => {
  return !!getErrors(error, field, index).length;
};

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [error, setError] = useState<$ZodErrorTree<NewPoll> | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    let enteredOptions = options;
    if (options.length > 1 && options[options.length - 1].trim() === '') {
      enteredOptions = options.slice(0, options.length - 1);
    }

    const parse = newPoll.safeParse({ question, options: enteredOptions });
    if (parse.success) {
      console.log('success', parse.data);
      setError(null);
    } else {
      setError(z.treeifyError(parse.error));
    }
  };

  const setOption = (idx: number, option: string) => {
    setOptions((curOptions) => {
      const newOptions = [...curOptions];
      newOptions[idx] = option;

      const hasContent = !!option.trim();
      if (hasContent && idx === newOptions.length - 1) {
        newOptions.push('');
      } else if (
        !hasContent &&
        idx === newOptions.length - 2 &&
        !newOptions[idx + 1]
      ) {
        newOptions.pop();
      }

      return newOptions;
    });
  };

  return (
    <div className='flex justify-center'>
      <div className='bg-secondary w-full max-w-xl p-3 rounded-xl'>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Create a Poll</FieldLegend>
              <FieldDescription>
                You'll get a link to share after submission
              </FieldDescription>
              <FieldGroup>
                <Field
                  className='gap-1'
                  data-invalid={hasError(error, 'question')}
                >
                  <FieldLabel htmlFor='question'>Question</FieldLabel>
                  <Input
                    id='question'
                    type='text'
                    placeholder="What's your favorite color?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    aria-invalid={hasError(error, 'question')}
                  />
                  <FieldError errors={getErrors(error, 'question')} />
                </Field>
              </FieldGroup>
              <FieldGroup className='gap-1'>
                {options.map((option, idx) => (
                  <Field
                    key={idx}
                    className='gap-1'
                    data-invalid={hasError(error, 'options', idx)}
                  >
                    <FieldLabel htmlFor={`option-${idx}`}>
                      Option #{idx + 1}
                    </FieldLabel>
                    <Input
                      id={`option-${idx}`}
                      type='text'
                      placeholder='Green'
                      value={option}
                      onChange={(e) => setOption(idx, e.target.value)}
                      aria-invalid={hasError(error, 'options', idx)}
                    />
                    <FieldError errors={getErrors(error, 'options', idx)} />
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
            <Field>
              <Button type='submit'>Submit</Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
