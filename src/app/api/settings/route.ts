import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, cardNumber } = await req.json();

    const { userId: clerkUserId, sessionClaims } = auth();

    if (!clerkUserId || !sessionClaims?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId || !cardNumber) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const email = sessionClaims.email as string;

    const existing = await prisma.setting.findUnique({
      where: { email }
    });

    let setting;
    if (existing) {
      setting = await prisma.setting.update({
        where: { email },
        data: { userId, cardNumber }
      });
    } else {
      setting = await prisma.setting.create({
        data: { userId, cardNumber, email }
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
