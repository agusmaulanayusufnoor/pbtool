import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const setting = await prisma.setting.findUnique({
      where: { email },
    });

    // Mengembalikan 404 dengan pesan yang jelas jika data tidak ditemukan
    if (!setting) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, userId, cardNumber } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!cardNumber) {
      return NextResponse.json({ error: 'Card number is required' }, { status: 400 });
    }

    // Menggunakan operasi 'upsert' untuk memperbarui atau membuat data
    const setting = await prisma.setting.upsert({
      where: { email },
      update: { userId, cardNumber },
      create: { email, userId, cardNumber },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
