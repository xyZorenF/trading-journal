import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define path to the JSON database
const DB_FILE = path.join(process.cwd(), 'trades_db.json');

// Helper to ensure DB exists and read data
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Handle GET requests (Fetch all trades)
export async function GET() {
  try {
    const trades = readDB();
    return NextResponse.json(trades);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read trades database.' }, { status: 500 });
  }
}

// Handle POST requests (Log a new trade)
export async function POST(request: Request) {
  try {
    const newTrade = await request.json();
    const trades = readDB();
    
    // Server-side R-Multiple capping
    if (newTrade.r_multiple < -1) {
       newTrade.r_multiple = -1.0;
    }

    trades.push(newTrade);
    fs.writeFileSync(DB_FILE, JSON.stringify(trades, null, 2));

    return NextResponse.json({ success: true, trade: newTrade }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save trade.' }, { status: 500 });
  }
}
