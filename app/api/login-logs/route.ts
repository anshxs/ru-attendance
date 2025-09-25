import { NextRequest, NextResponse } from 'next/server';
import { saveLoginLog, getLoginLogs } from '@/lib/login-logs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, status, errorMessage } = await request.json();
    
    if (!email || !password || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await saveLoginLog(email, password, status, errorMessage);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save login log' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await getLoginLogs();
    
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch login logs' },
      { status: 500 }
    );
  }
}