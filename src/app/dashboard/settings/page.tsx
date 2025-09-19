'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import SettingForm from '@/components/forms/SettingForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SettingData {
  id: number;
  userId: string;
  cardNumber: string;
  email: string;
}

export default function SettingsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [setting, setSetting] = useState<SettingData | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className='mx-auto mt-10 max-w-md'>
      <SettingForm
        onSaved={fetchSetting}
        initialData={setting}
        userEmail={userEmail}
      />

      <div className='mt-6'>
        <Card>
          <CardHeader>
            <CardTitle>Data Setting</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading data setting...</p>
            ) : setting && setting.userId ? (
              <div className='space-y-2'>
                <p>
                  <strong>User ID:</strong> {setting.userId}
                </p>
                <p>
                  <strong>Card Number:</strong> {setting.cardNumber}
                </p>
                <p>
                  <strong>Email:</strong> {setting.email}
                </p>
              </div>
            ) : (
              <p>Belum ada data setting.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
