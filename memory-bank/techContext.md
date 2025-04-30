# Technical Context: SimAddict

## Core Technologies

-   **HTML5:** For structuring the web page content.
-   **CSS3:** For styling the user interface.
-   **JavaScript (ES6+):** For application logic, DOM manipulation, API interaction, and handling user events. No external JS frameworks (like React, Vue, Angular) are planned.

## Browser APIs Used

-   **Fetch API:** For making asynchronous HTTP requests to the user-configured AI endpoint.
    -   Requires handling `POST` requests, setting `Authorization: Bearer <key>` header, and sending JSON payloads compatible with the OpenAI Chat Completions API format.
    -   **Streaming (SSE):** Needs to handle Server-Sent Events for the outline generation step, parsing `data:` lines from the response stream. Requires setting `stream: true` in the API request body.
    -   Needs error handling for network issues, API errors, and potential stream interruptions.
-   **`localStorage` API:** For persisting user API profiles (endpoint URL, key, model ID) across browser sessions. Used for save, load, and **delete** operations.
    -   Data stored as key-value pairs (likely storing profiles as JSON strings).
    -   Subject to browser storage limits and same-origin policy. Data is not automatically synced or backed up.
-   **DOM Manipulation APIs:** Standard methods for interacting with the HTML structure, including dynamically showing/hiding sections for the step-by-step flow and managing collapsible elements.
-   **`iframe.srcdoc`:** Used to dynamically render the generated HTML content within the iframe, potentially transitioning to a full-frame view.
-   **Blob API & `URL.createObjectURL()`:** Used to create a downloadable file object from the generated HTML string in memory.
-   **`<a>` element `download` attribute:** Used in conjunction with the Blob URL to trigger a file download.
-   **(Potentially) Fullscreen API:** May be used to enhance the full-frame preview experience, though CSS techniques might suffice.

## Development Environment

-   **Local Files:** Runs directly by opening `index.html`.
-   **No Build Step:** Maintained.
-   **Browser Compatibility:** Modern evergreen browsers. SSE support is generally good in modern browsers.

## External Dependencies

-   **User-Provided AI Endpoint:** Relies on user configuration of a working OpenAI-compatible endpoint supporting chat completions (and ideally streaming).
-   **Markdown Parsing Library (Planned):** Will likely require adding a third-party JavaScript library (e.g., Marked.js, Showdown.js) via CDN or local file to render the Markdown outline correctly.

## Constraints (v1.1)

-   **Local Operation:** All logic and data storage (profiles) are confined to the user's browser. No server-side processing or database.
-   **API Costs:** Users are responsible for any costs incurred from using their API keys with the configured endpoint.
-   **Security:** API keys are stored in `localStorage`, which is generally considered insecure for sensitive credentials if the user's machine is compromised or vulnerable to XSS attacks on the page (though the risk is lower for a local-only file). Users should be aware of this. The application *must not* transmit the API key anywhere other than directly to the user-specified API endpoint.
