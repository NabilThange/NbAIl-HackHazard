import type { NextApiRequest, NextApiResponse } from 'next';

// Define the expected shape of the response data from the Terminator agent
// and also the shape of the error response we might send.
type TerminatorResponse = {
  status: string;
  message: string;
} | { error: string };

// Define the expected shape of the incoming request body
type TerminatorRequestBody = {
  app: string;
  action?: string | null; // Action is optional
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

  const { app, action }: TerminatorRequestBody = req.body;

  // Basic validation: ensure 'app' is provided
  if (!app) {
    return res.status(400).json({ error: "'app' field is required in the request body." });
  }

  const terminatorUrl = 'http://127.0.0.1:8000/execute';
  const payload = { app, action: action ?? null }; // Ensure action is null if undefined/empty

  console.log('[API /api/terminator] Received request:', payload);

  try {
    const response = await fetch(terminatorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Explicitly accept JSON
      },
      body: JSON.stringify(payload),
    });

    // Try to parse the JSON response from the agent
    let agentResponseData: TerminatorResponse;
    try {
      agentResponseData = await response.json();
    } catch (parseError) {
      // Handle cases where the agent returns non-JSON response or empty body
      console.error('[API /api/terminator] Failed to parse JSON response from agent:', parseError);
      console.error('[API /api/terminator] Agent raw response status:', response.status);
      const responseText = await response.text(); // Read the raw response text for logging
      console.error('[API /api/terminator] Agent raw response text:', responseText);
      return res.status(502).json({ // 502 Bad Gateway seems appropriate here
        error: `Received invalid response from Terminator agent. Status: ${response.status}`,
      });
    }

    console.log(`[API /api/terminator] Response from agent (Status ${response.status}):`, agentResponseData);

    // Forward the agent's status code and JSON response
    res.status(response.status).json(agentResponseData);

  } catch (error: any) {
    console.error('[API /api/terminator] Error connecting to Terminator agent:', error);

    // Check if the error is a connection refusal (agent likely offline)
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return res.status(503).json({ error: 'Terminator agent is offline or unreachable.' }); // 503 Service Unavailable
    } else {
      // Handle other potential fetch errors
      return res.status(500).json({ error: 'Internal server error relaying request to Terminator agent.' });
    }
  }
} 