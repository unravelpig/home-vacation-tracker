import { NextResponse } from 'next/server';
import countriesData from '@/public/data/countries.json';

export async function GET() {
  return NextResponse.json(countriesData);
}
