// Cloudflare Function to proxy API requests
// This will bypass browser CORS restrictions by making the request server-side.

export async function onRequestPost(context) {
  try {
    // Get the target URL, API key, and request body from the frontend request
    // We'll need to decide how the frontend sends this data (e.g., headers, JSON body)
    const requestData = await context.request.json();
    const { targetUrl, apiKey, payload } = requestData;

    if (!targetUrl || !apiKey || !payload) {
      return new Response(JSON.stringify({ error: 'Missing targetUrl, apiKey, or payload in proxy request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepare the request to the actual target API
    const apiRequest = new Request(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // IMPORTANT: Copy other relevant headers if needed, but avoid copying Host, etc.
      },
      body: JSON.stringify(payload),
    });

    // Make the actual API call from the Cloudflare Function
    const apiResponse = await fetch(apiRequest);

    // Check if the target API supports streaming and if the original request asked for it
    const streamRequested = payload.stream === true;
    const contentType = apiResponse.headers.get('content-type');
    const supportsStreaming = contentType && contentType.includes('text/event-stream');

    if (streamRequested && supportsStreaming) {
      // If streaming is supported and requested, stream the response back
      // We need to ensure headers are correctly passed for SSE
      const responseHeaders = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // Add CORS headers to allow *your frontend* to call *this proxy function*
        'Access-Control-Allow-Origin': '*', // Or specify your Pages domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });

      // Return the streamed response directly
      return new Response(apiResponse.body, {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: responseHeaders,
      });

    } else {
      // If not streaming, return the full response body
      const responseBody = await apiResponse.text(); // Use text() to handle potential non-JSON errors
      const responseHeaders = new Headers({
         // Use the content type from the target API response if available, else default
        'Content-Type': contentType || 'application/json',
         // Add CORS headers
        'Access-Control-Allow-Origin': '*', // Or specify your Pages domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });

      // Try to parse as JSON, but return text if it fails
      let parsedBody;
      try {
        parsedBody = JSON.parse(responseBody);
      } catch (e) {
        // If parsing fails, it might be an error message or non-JSON content
        // Return the raw text with an appropriate status code
         if (apiResponse.ok) {
           // If status was OK but body wasn't JSON, treat as plain text
           responseHeaders.set('Content-Type', 'text/plain');
           return new Response(responseBody, {
             status: apiResponse.status,
             statusText: apiResponse.statusText,
             headers: responseHeaders,
           });
         } else {
           // If status was not OK and body wasn't JSON, return text error
           responseHeaders.set('Content-Type', 'text/plain');
           return new Response(`Error from target API: ${responseBody}`, {
             status: apiResponse.status,
             statusText: apiResponse.statusText,
             headers: responseHeaders,
           });
         }
      }

      // Return the JSON response
      return new Response(JSON.stringify(parsedBody), {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        headers: responseHeaders,
      });
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Proxy function failed', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // CORS for error response
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
       },
    });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Or specify your Pages domain
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // Cache preflight for 1 day
    },
  });
}
