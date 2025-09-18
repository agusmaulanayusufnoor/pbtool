'use client';

import { useEffect, useState } from 'react';
import { useUser  } from '@clerk/clerk-react';
import SettingForm from '@/components/forms/SettingForm';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';

interface SettingData {
  id: number;
  userId: string;
  cardNumber: string;
  email: string;
}

export default function SettingsPage() {
  const { user, isLoaded, isSignedIn } = useUser ();
  const [setting, setSetting] = useState<SettingData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSetting = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setSetting(data);
      } else {
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
    if (isLoaded && isSignedIn && user?.emailAddresses?.[0]?.emailAddress) {
      fetchSetting(user.emailAddresses[0].emailAddress);
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded) {
    return <div>Loading user...</div>;
  }

  if (!isSignedIn) {
    return <div>Anda harus login untuk mengakses halaman ini.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <SettingForm onSaved={() => {
        if (user?.emailAddresses?.[0]?.emailAddress) {
          fetchSetting(user.emailAddresses[0].emailAddress);
        }
      }} />
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Setting</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading data setting...</p>
            ) : setting ? (
              <div className="space-y-2">
                <p><strong>ID:</strong> {setting.userId}</p>
                <p><strong>Card Number:</strong> {setting.cardNumber}</p>
                <p><strong>Email:</strong> {setting.email}</p>
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
