// functions/api/proxy.js

export async function onRequestPost(context) {
    try {
        const { request } = context;
        const body = await request.json();

        const { endpoint, apiKey, modelId, messages } = body;

        if (!endpoint || !apiKey || !modelId || !messages) {
            return new Response(JSON.stringify({ error: "Missing required parameters (endpoint, apiKey, modelId, messages)" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Forward the request to the actual LLM API endpoint
        const upstreamResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                // Include other headers from the original request if necessary,
                // but be cautious about forwarding sensitive headers.
                // For OpenRouter, HTTP-Referer and X-Title are recommended.
                'HTTP-Referer': request.headers.get('HTTP-Referer') || 'https://simaddict.gwyn.tel', // Use a default if not provided
                'X-Title': request.headers.get('X-Title') || 'SimAddict' // Use a default if not provided
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages,
                // Pass through other potential parameters from the original request body
                // This requires careful handling to avoid forwarding unexpected fields
                // For simplicity, we'll only forward model and messages for now,
                // but this can be extended based on the needs of script.js
                // ... other parameters from body if needed ...
            })
        });

        // Return the response from the upstream API
        const responseBody = await upstreamResponse.json();

        return new Response(JSON.stringify(responseBody), {
            status: upstreamResponse.status,
            headers: {
                'Content-Type': 'application/json',
                // Add CORS headers to allow access from your frontend origin
                'Access-Control-Allow-Origin': '*', // Replace with your frontend origin in production
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title',
            }
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle OPTIONS requests for CORS preflight
export async function onRequestOptions(context) {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*', // Replace with your frontend origin in production
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title',
            'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
        },
    });
}
