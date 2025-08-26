import { NextRequest, NextResponse } from 'next/server'
import { xenditClient, XenditCallbackData } from '@/lib/xendit-client'
import { updatePaymentStatus, topUpBalance } from '@/lib/supabase-queries'

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Xendit webhook received')
    
    // Get the raw body
    const body = await request.text()
    console.log('📨 Webhook body:', body)
    
    // Parse the JSON
    const callbackData: XenditCallbackData = JSON.parse(body)
    console.log('📨 Parsed callback data:', callbackData)
    
    // Verify the webhook (optional - you can add signature verification here)
    // const xenditCallbackToken = request.headers.get('x-callback-token')
    // if (xenditCallbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
    //   return NextResponse.json({ error: 'Invalid callback token' }, { status: 401 })
    // }
    
    // Handle the callback
    await xenditClient.handleCallback(callbackData)
    
    // Update payment status in database
    if (callbackData.status === 'PAID' || callbackData.status === 'SETTLED') {
      console.log('✅ Payment confirmed, updating database...')
      
      // Extract user_id from external_id (format: topup_userId_timestamp)
      const parts = callbackData.external_id.split('_')
      if (parts.length >= 2 && parts[0] === 'topup') {
        const userId = parts[1]
        
        // Update payment status to paid
        // Note: You'll need to find the payment by external_id first
        // await updatePaymentStatus(paymentId, 'paid')
        
        // Add balance to user account
        await topUpBalance(userId, callbackData.amount)
        
        console.log('✅ Balance updated for user:', userId, 'Amount:', callbackData.amount)
      }
    } else if (callbackData.status === 'EXPIRED') {
      console.log('⏰ Payment expired:', callbackData.external_id)
      // Update payment status to expired
      // await updatePaymentStatus(paymentId, 'expired')
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
    
  } catch (error) {
    console.error('❌ Xendit webhook error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ 
    message: 'Xendit webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}