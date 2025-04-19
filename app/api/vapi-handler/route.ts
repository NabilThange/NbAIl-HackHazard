import { type NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests from Vapi.ai webhooks.
 * Reads the request body, logs it, and sends a simple reply.
 */
export async function POST(request: NextRequest) {
  console.log('Received request on /api/vapi-handler');

  let requestBody;
  try {
    // Vapi sends data as JSON in the request body
    requestBody = await request.json();
    console.log('Vapi Webhook Body:', JSON.stringify(requestBody, null, 2)); // Log the parsed body
    // Added a comment to trigger redeployment
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // You can add more logic here later to process different Vapi message types
  // like 'assistant-request', 'function-call', 'end-of-call-report', etc.
  // For now, just sending a standard reply.

  const responsePayload = { reply: "This is a test response from NbAIl" };

  console.log('Sending response:', JSON.stringify(responsePayload, null, 2));

  return NextResponse.json(responsePayload);
}

// Optional: Handle GET requests or other methods if needed, or return 405 Method Not Allowed
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
} 