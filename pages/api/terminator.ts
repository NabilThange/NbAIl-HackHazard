import type { NextApiRequest, NextApiResponse } from 'next';

// Define the expected shape of the response data from the Terminator agent
// and also the shape of the error response we might send.
type TerminatorResponse = {
  status?: string; // Make optional as error might not have it
  message?: string; // Make optional as error might not have it
  error?: string; // Add error field
};

// Define the expected shape of the incoming request body
type TerminatorRequestBody = {
  app: string;
  action?: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TerminatorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // --- Check for TERMINATOR_URL environment variable --- 
  const terminatorBaseUrl = process.env.TERMINATOR_URL;
  if (!terminatorBaseUrl) {
    console.error('[API /api/terminator] TERMINATOR_URL environment variable is not set.');
    return res.status(500).json({ error: 'Server configuration error: Terminator agent URL is not set.' });
  }
  // -----------------------------------------------------

  const { app, action }: TerminatorRequestBody = req.body;

  // Basic validation: ensure 'app' is provided
  if (!app) {
    return res.status(400).json({ error: "'app' field is required in the request body." });
  }

  const terminatorExecuteUrl = `${terminatorBaseUrl.replace(/\/$/, '')}/execute`; // Ensure no trailing slash, add /execute
  const payload = { app, action: action ?? null };

  console.log(`[API /api/terminator] Received request: ${JSON.stringify(payload)}`);
  console.log(`[API /api/terminator] Forwarding to: ${terminatorExecuteUrl}`);

  try {
    const response = await fetch(terminatorExecuteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      // Add a reasonable timeout (e.g., 10 seconds)
      // Note: AbortController is the standard way, but might require more setup depending on Next.js version/fetch polyfills
      // signal: AbortSignal.timeout(10000), 
    });

    let agentResponseData: TerminatorResponse;
    try {
      agentResponseData = await response.json();
    } catch (parseError) {
      console.error('[API /api/terminator] Failed to parse JSON response from agent:', parseError);
      const responseText = await response.text();
      console.error('[API /api/terminator] Agent raw response status:', response.status);
      console.error('[API /api/terminator] Agent raw response text:', responseText);
      // Forward the status but provide a clear error message
      return res.status(response.status || 502).json({ 
        error: `Received invalid response from Terminator agent (Status: ${response.status}). Body: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`,
      });
    }

    console.log(`[API /api/terminator] Response from agent (Status ${response.status}):`, agentResponseData);

    // Forward the agent's status code and JSON response
    res.status(response.status).json(agentResponseData);

  } catch (error: any) {
    console.error(`[API /api/terminator] Error connecting to Terminator agent at ${terminatorExecuteUrl}:`, error);

    // Improved error checking
    let errorMessage = 'Failed to connect to Terminator agent.';
    let statusCode = 503; // Service Unavailable

    if (error.cause?.code === 'ECONNREFUSED') {
      errorMessage = `Connection refused by Terminator agent at ${terminatorExecuteUrl}. Is it running and accessible?`;
    } else if (error.cause?.code === 'ENOTFOUND' || error.message?.includes('fetch failed')) {
       errorMessage = `Could not resolve Terminator agent hostname: ${terminatorExecuteUrl}. Check the URL.`;
       statusCode = 502; // Bad Gateway
    } else if (error.name === 'TimeoutError' || error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        errorMessage = `Connection timed out connecting to Terminator agent at ${terminatorExecuteUrl}.`;
        statusCode = 504; // Gateway Timeout
    } else {
      // Generic internal server error for other fetch issues
      errorMessage = `Internal server error relaying request: ${error.message}`; 
      statusCode = 500;
    }
    
    return res.status(statusCode).json({ error: errorMessage });
  }
} 