'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from './form-input';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';

const schema = z.object({
  userId: z.string().min(1, 'ID wajib diisi'),
  cardNumber: z.string().min(1, 'Card Number wajib diisi')
});

type SettingFormValues = z.infer<typeof schema>;

interface SettingFormProps {
  onSaved: () => void;
}

export default function SettingForm({ onSaved }: SettingFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: '',
      cardNumber: ''
    }
  });

  const onSubmit = async (values: SettingFormValues) => {
    setMessage(null);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(values) // tidak perlu kirim email
    });
    if (res.ok) {
      setMessage('Data berhasil disimpan!');
      form.reset();
      onSaved();
    } else {
      const data = await res.json();
      setMessage(data.error || 'Gagal menyimpan data');
    }
  };

  return (
    <Card className='mx-auto max-w-md'>
      <CardHeader>
        <CardTitle>Setting</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8'
        >
          <FormInput
            control={form.control}
            name='userId'
            label='ID'
            required
            placeholder='Masukkan ID'
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              form.setValue('userId', value, { shouldValidate: true });
            }}
          />
          <FormInput
            control={form.control}
            name='cardNumber'
            label='Card Number'
            required
            placeholder='Masukkan Card Number'
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              form.setValue('cardNumber', value, { shouldValidate: true });
            }}
          />
          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
            className='w-full'
          >
            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
          {message && (
            <div className='mt-2 text-sm text-green-600'>{message}</div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
