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

// Handle DELETE requests (Delete a trade)
export async function DELETE(request: Request) {
  try {
    const { timestamp } = await request.json();
    if (!timestamp) {
      return NextResponse.json({ error: 'Timestamp is required to delete.' }, { status: 400 });
    }

    let trades = readDB();
    const initialLength = trades.length;
    trades = trades.filter((t: any) => t.timestamp !== timestamp);

    if (trades.length === initialLength) {
      return NextResponse.json({ error: 'Trade not found.' }, { status: 404 });
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(trades, null, 2));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trade.' }, { status: 500 });
  }
}

// Handle PUT requests (Edit an existing trade by timestamp)
export async function PUT(request: Request) {
  try {
    const { originalTimestamp, updatedTrade } = await request.json();
    if (!originalTimestamp || !updatedTrade) {
      return NextResponse.json({ error: 'originalTimestamp and updatedTrade are required.' }, { status: 400 });
    }

    let trades = readDB();
    const idx = trades.findIndex((t: any) => t.timestamp === originalTimestamp);

    if (idx === -1) {
      return NextResponse.json({ error: 'Trade not found.' }, { status: 404 });
    }

    // Server-side R-Multiple capping
    if (updatedTrade.r_multiple < -1) {
      updatedTrade.r_multiple = -1.0;
    }

    trades[idx] = updatedTrade;
    fs.writeFileSync(DB_FILE, JSON.stringify(trades, null, 2));
    return NextResponse.json({ success: true, trade: updatedTrade }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trade.' }, { status: 500 });
  }
}
