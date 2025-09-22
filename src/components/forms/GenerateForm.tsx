'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { FormInput } from './form-input';
import { FormSelect } from './form-select';
import { useState } from 'react';

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Amount wajib diisi')
    .regex(/^\d+$/, 'Amount harus berupa angka'),
  function: z.string().min(1, 'Function wajib dipilih')
});

type GenerateFormValues = z.infer<typeof schema>;

interface GenerateFormProps {
  onGenerated: (result: any) => void;
  initialData?: {
    id: number;
    userId: string;
    cardNumber: string;
    email: string;
  } | null;
  userEmail?: string;
  defaultFunction?: string;
}

const functionOptions = [
  { value: '02', label: '02 - Settlement amount' },
  { value: '01', label: '01 - New Limit' }
];

export default function GenerateForm({
  onGenerated,
  initialData,
  userEmail,
  defaultFunction = '02'
}: GenerateFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '',
      function: defaultFunction
    }
  });

  // Format timestamp untuk CDC file
  const formatCDCTimestamp = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return {
      date: `${day}${month}${year}`,
      time: `${hours}${minutes}${seconds}`,
      display: `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
    };
  };

  // Format filename sesuai aturan
  const formatFileName = (code: string) => {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `FG${code}${year}${month}${day}${hours}${minutes}.txt`;
  };

  const onSubmit = async (values: GenerateFormValues) => {
    if (!userEmail || !initialData) {
      setMessage('Data user tidak lengkap');
      return;
    }

    setMessage(null);
    setIsGenerating(true);

    const cdcTimestamp = formatCDCTimestamp();
    const fileName = formatFileName(initialData.userId);

    const dataToSend = {
      email: userEmail,
      userId: initialData.userId,
      cardNumber: initialData.cardNumber,
      fileName: initialData.userId,
      amount: values.amount,
      function: values.function,
      timestamp: cdcTimestamp,
      fileNameGenerated: fileName
    };

    try {
      const res = await fetch('/api/generates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('Text berhasil digenerate!');
        onGenerated(result);
      } else {
        setMessage(result.error || 'Gagal generate text');
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat generate text');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className='mx-auto max-w-md dark:bg-[#273F4F] dark:text-gray-200'>
      <CardHeader>
        <CardTitle>Generate Text</CardTitle>
      </CardHeader>
      <CardContent>
        {userEmail && (
          <div className='mb-4 rounded-md bg-gray-100 p-3'>
            <p className='text-sm text-gray-600'>
              <strong>Email:</strong> {userEmail}
            </p>
          </div>
        )}

        {initialData && (
          <>
            <div className='mb-4 rounded-md bg-gray-100 p-3'>
              <p className='text-sm text-gray-600'>
                <strong>User ID:</strong> {initialData.userId}
              </p>
            </div>
            <div className='mb-4 rounded-md bg-gray-100 p-3'>
              <p className='text-sm text-gray-600'>
                <strong>Card Number:</strong> {initialData.cardNumber}
              </p>
            </div>
            <div className='mb-4 rounded-md bg-blue-100 p-3'>
              <p className='text-sm text-blue-600'>
                <strong>File Name (Kode):</strong> {initialData.userId}{' '}
                <span className='text-xs text-blue-500'>
                  (diambil dari User ID)
                </span>
              </p>
            </div>
          </>
        )}

        <div className='mb-4 rounded-md bg-blue-50 p-3'>
          <p className='text-sm text-blue-600'>
            <strong>Tanggal:</strong> {formatCDCTimestamp().display}
          </p>
        </div>

        {/* Perbaikan: Mengubah onSubmit ke onSubmit */}
        <Form form={form} onSubmit={onSubmit} className='space-y-6'>
          <FormSelect
            control={form.control}
            name='function'
            label='Function'
            placeholder='Pilih function'
            options={functionOptions}
            required
          />

          <FormInput
            control={form.control}
            name='amount'
            label='Amount'
            required
            placeholder='Masukkan amount (angka saja)'
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              form.setValue('amount', value, { shouldValidate: true });
            }}
          />

          <Button
            type='submit'
            disabled={isGenerating || !initialData}
            className='w-full'
          >
            {isGenerating ? 'Generating...' : 'Generate'}
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
