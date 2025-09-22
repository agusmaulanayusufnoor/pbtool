'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import GenerateForm from '@/components/forms/GenerateForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';

interface SettingData {
  id: number;
  userId: string;
  cardNumber: string;
  email: string;
}

interface GenerateResult {
  success: boolean;
  message?: string;
  generatedText?: string;
  fileName?: string;
  data?: any;
}

export default function GeneratePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [setting, setSetting] = useState<SettingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(
    null
  );

  const fetchSetting = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      console.log('No email address found');
      return;
    }

    setLoading(true);
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;
      console.log('Fetching settings for email:', userEmail);

      const res = await fetch(
        `/api/settings?email=${encodeURIComponent(userEmail)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSetting(data);
      } else if (res.status === 404) {
        console.log('No setting data found for this user.');
        setSetting(null);
      } else {
        const errorText = await res.text();
        console.error(`Error ${res.status}: ${errorText}`);
        setSetting(null);
      }
    } catch (error) {
      console.error('Fetch setting error:', error);
      setSetting(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerated = (result: GenerateResult) => {
    setGenerateResult(result);
  };

  const copyToClipboard = () => {
    if (generateResult?.generatedText) {
      navigator.clipboard.writeText(generateResult.generatedText);
      alert('Text berhasil disalin ke clipboard!');
    } else {
      alert('Tidak ada teks untuk disalin');
    }
  };

  const downloadFile = () => {
    if (!generateResult?.generatedText) {
      alert('Tidak ada teks untuk didownload');
      return;
    }
    
    const blob = new Blob(
      [generateResult.generatedText],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      generateResult.fileName ||
      `cdc_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      console.log('User is signed in. Initiating data fetch...');
      fetchSetting();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return <div>Loading user...</div>;
  }

  if (!isSignedIn) {
    return <div>Anda harus login untuk mengakses halaman ini.</div>;
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Generate Text</h1>
            <p className='text-muted-foreground'>
              Generate text file CDC dengan format Bank Permata
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='space-y-6'>
            <GenerateForm
              onGenerated={handleGenerated}
              initialData={setting}
              userEmail={userEmail}
              defaultFunction="02" // Default value untuk combobox function
            />

            {!setting && !loading && (
              <Card>
                <CardContent className='p-6'>
                  <div className='space-y-4'>
                    <p className='text-red-600'>
                      Anda harus mengisi setting terlebih dahulu sebelum bisa
                      generate text.
                    </p>
                    <Button
                      onClick={() =>
                        (window.location.href = '/dashboard/settings')
                      }
                      className='w-full'
                    >
                      Ke Halaman Setting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className='space-y-6'>
            {generateResult && (
              <Card className='h-fit dark:bg-[#333446] dark:text-gray-200'>
                <CardHeader>
                  <CardTitle>Hasil Generate</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {generateResult.generatedText ? (
                    <div className='space-y-4'>
                      <div className='max-h-96 overflow-y-auto rounded-md bg-gray-100 p-4'>
                        <pre className='text-sm break-words whitespace-pre-wrap'>
                          {generateResult.generatedText}
                        </pre>
                      </div>
                      <div className='grid grid-cols-2 gap-2'>
                        <Button
                          onClick={copyToClipboard}
                          variant='outline'
                          className='w-full'
                          disabled={!generateResult.generatedText}
                        >
                          Salin ke Clipboard
                        </Button>
                        <Button
                          onClick={downloadFile}
                          variant='default'
                          className='w-full'
                          disabled={!generateResult.generatedText}
                        >
                          Download File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>
                      {generateResult.message || 'Tidak ada hasil'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {!generateResult && (
              <Card className='h-fit dark:bg-[#333446] dark:text-gray-200'>
                <CardHeader>
                  <CardTitle>Preview Hasil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <p className='text-muted-foreground'>
                      Hasil generate text CDC akan muncul di sini setelah Anda
                      mengklik tombol Generate.
                    </p>
                    <div className='rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center'>
                      <p className='text-sm text-gray-500'>Preview area</p>
                      <p className='mt-2 text-xs text-gray-400'>
                        Text CDC akan muncul di sini dengan format Header dan
                        Detail
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informasi card */}
            <Card className='h-fit dark:bg-[#333446] dark:text-gray-200'>
              <CardHeader>
                <CardTitle>Informasi Format CDC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 text-sm'>
                  <div>
                    <span className='font-medium'>Format Header:</span>
                    <code className='mt-1 ml-2 block rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700'>
                      1 + File Name + Desc (14 spasi) + Tanggal (MMDDYYYY) + Time (HHMMSS) + # of Record (6 digit)
                    </code>
                  </div>
                  <div>
                    <span className='font-medium'>Format Detail:</span>
                    <code className='mt-1 ml-2 block rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700'>
                      Record Type (2) + Sequence Number (6 digit) + Card Number
                      (16 digit) + Function (2 digit) + Amount (15 digit: 13 digit utama + 2 digit desimal 00) + Date
                      (MMDDYYYY) + Time (HHMMSS) + Check Sum (6 digit)
                    </code>
                  </div>
                  <div>
                    <span className='font-medium'>Format Nama File:</span>
                    <code className='mt-1 ml-2 block rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700'>
                      FG + USER_ID (6 digit) + DATE (YYMMDD) + TIME (HHMM).txt
                    </code>
                  </div>
                  <div>
                    <span className='font-medium'>Function:</span>
                    <ul className='mt-1 ml-4 space-y-1 text-xs'>
                      <li>• 01 - New Limit</li>
                      <li>• <strong>02 - Settlement amount (Default)</strong></li>
                    </ul>
                  </div>
                  <div>
                    <span className='font-medium'>Contoh Output:</span>
                    <code className='mt-1 ml-2 block rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700'>
                      1CDCKRT              09222025153340000001
                      <br />
                      200000146400558800789120100000500000000009222025153340000123
                    </code>
                    <p className='mt-1 text-xs text-gray-500'>
                      * File Name (CDCKRT) diambil dari User ID di setting
                      <br />* Desc: 14 spasi
                      <br />* Tanggal header: MMDDYYYY (09222025 = September 22, 2025)
                      <br />* Amount: 15 digit dengan 2 digit terakhir selalu &apos;00&apos;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}