import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  email: string;
  userId: string;
  cardNumber: string;
  fileName: string;
  amount: string;
  function: string;
  timestamp: {
    date: string;
    time: string;
    display: string;
  };
  fileNameGenerated: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      userId,
      cardNumber,
      fileName,
      amount,
      function: func,
      timestamp,
      fileNameGenerated
    }: GenerateRequest = await req.json();

    // Validasi input
    if (
      !email ||
      !userId ||
      !cardNumber ||
      !fileName ||
      !amount ||
      !func ||
      !timestamp
    ) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi amount harus angka
    if (!/^\d+$/.test(amount)) {
      return NextResponse.json(
        { error: 'Amount harus berupa angka' },
        { status: 400 }
      );
    }

    // Validasi function harus 01 atau 02
    if (!['01', '02'].includes(func)) {
      return NextResponse.json(
        { error: 'Function harus 01 (New Limit) atau 02 (Settlement amount)' },
        { status: 400 }
      );
    }

    // Generate CDC file format sesuai aturan
    // Format Header: 1 + File Name + spasi + Desc (kosong) + Tanggal + Bulan + Tahun + Jam + Menit + Detik + # of Record
    const headerRecordCount = '000001'; // 6 digit, untuk 1 record
    const headerDesc = ' '.repeat(6); // 6 karakter kosong untuk Desc

    // Parse timestamp dari format DDMMYYYYHHMMSS
    const day = timestamp.date.substring(0, 2);
    const month = timestamp.date.substring(2, 4);
    const year = timestamp.date.substring(4, 8);
    const hours = timestamp.time.substring(0, 2);
    const minutes = timestamp.time.substring(2, 4);
    const seconds = timestamp.time.substring(4, 6);

    const header = `1${fileName} ${headerDesc}${day}${month}${year}${hours}${minutes}${seconds}${headerRecordCount}`;

    // Format Detail: Record Type + Sequence Number + Card Number + Function + Amount + Date + Time + Check Sum
    const recordType = '2';
    const sequenceNumber = '000001'; // 6 digit nomor urut
    const cardNumberPadded = cardNumber.padStart(16, '0'); // 16 digit
    const amountPadded = amount.padStart(13, '0'); // 13 digit dengan 2 digit terakhir sebagai desimal
    const dateMMDDYYYY = `${month}${day}${year}`; // MMDDYYYY
    const timeHHMMSS = timestamp.time;

    // Hitung checksum (rumus penjumlahan kolom-kolom sebelumnya)
    const checksumData = `${recordType}${sequenceNumber}${cardNumberPadded}${func}${amountPadded}${dateMMDDYYYY}${timeHHMMSS}`;
    let checksum = 0;
    for (let i = 0; i < checksumData.length; i++) {
      checksum += parseInt(checksumData[i]) || 0;
    }
    const checksumPadded = String(checksum).padStart(6, '0');

    const detail = `${recordType}${sequenceNumber}${cardNumberPadded}${func}${amountPadded}${dateMMDDYYYY}${timeHHMMSS}${checksumPadded}`;

    // Gabungkan header dan detail
    const generatedText = `${header}\n${detail}`;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Text berhasil digenerate',
      generatedText: generatedText,
      fileName: fileNameGenerated,
      data: {
        email,
        userId,
        cardNumber,
        fileName,
        function: func,
        amount,
        timestamp: timestamp.display,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('POST /api/generates error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'API Generate Text - Gunakan method POST untuk generate text',
    endpoints: {
      POST: '/api/generates - Generate text file CDC'
    },
    format: 'CDC File Format dengan Header dan Detail',
    headerFormat:
      '1 + File Name + Desc (6 spasi) + Tanggal (DDMMYYYY) + Time (HHMMSS) + # of Record (6 digit)',
    detailFormat:
      'Record Type (2) + Sequence Number (6 digit) + Card Number (16 digit) + Function (2 digit) + Amount (13 digit) + Date (MMDDYYYY) + Time (HHMMSS) + Check Sum (6 digit)',
    fileNameFormat: 'FG + KODE (6 digit) + DATE (YYMMDD) + TIME (HHMM).txt',
    functions: [
      { code: '01', description: 'New Limit' },
      { code: '02', description: 'Settlement amount' }
    ]
  });
}
