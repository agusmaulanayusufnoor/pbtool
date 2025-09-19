'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormInput } from './form-input';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const schema = z.object({
  userId: z.string().min(1, 'ID wajib diisi'),
  cardNumber: z.string().min(1, 'Card Number wajib diisi')
});

type SettingFormValues = z.infer<typeof schema>;

interface SettingFormProps {
  onSaved: () => void;
  initialData?: {
    id: number;
    userId: string;
    cardNumber: string;
    email: string;
  } | null;
  userEmail?: string;
}

export default function SettingForm({
  onSaved,
  initialData,
  userEmail
}: SettingFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: initialData?.userId || '',
      cardNumber: initialData?.cardNumber || ''
    }
  });

  // Reset form ketika initialData berubah
  useEffect(() => {
    if (initialData) {
      form.reset({
        userId: initialData.userId,
        cardNumber: initialData.cardNumber
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: SettingFormValues) => {
    if (!userEmail) {
      setMessage('Email tidak tersedia');
      return;
    }

    setMessage(null);

    const dataToSend = {
      email: userEmail,
      userId: values.userId,
      cardNumber: values.cardNumber
    };

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dataToSend)
    });

    if (res.ok) {
      setMessage('Data berhasil disimpan!');
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
        {userEmail && (
          <div className='mb-4 rounded-md bg-gray-100 p-3'>
            <p className='text-sm text-gray-600'>
              <strong>Email:</strong> {userEmail}
            </p>
          </div>
        )}

        <Form form={form} onSubmit={onSubmit} className='space-y-8'>
          <FormInput
            control={form.control}
            name='userId'
            label='User ID'
            required
            placeholder='Masukkan User ID'
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
            <div
              className={`mt-2 text-sm ${
                message.includes('berhasil') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
