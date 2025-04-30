# System Patterns: SimAddict (v1.1 Enhancements)

## Architecture

-   **Client-Side Single Page Application (SPA):** Runs entirely in the user's browser. No backend.
-   **Sequential UI Flow:** UI sections (API Config, Prompt, Outline, Preview) are presented one after another ("step-by-step tiles") to guide the user and improve mobile usability. Sections are shown/hidden dynamically.
-   **Local Storage Persistence:** API profiles stored in `localStorage`.
-   **External API Interaction:** Direct interaction with user-provided OpenAI-compatible API via Fetch API.

## Key Technical Decisions (v1.1)

-   **Vanilla JavaScript, HTML, CSS:** Maintained for simplicity.
-   **`localStorage` for Profiles:** Used for saving, loading, and **deleting** API profiles.
-   **Collapsible Sections:** API configuration section can be collapsed/expanded, potentially based on whether profiles exist.
-   **Fetch API for AI Calls:** Used for both outline and code generation.
    -   **Streaming (SSE) for Outline:** The outline generation call will request and handle a streaming response (Server-Sent Events) to display results progressively.
    -   Standard request/response for code generation.
-   **Markdown Rendering:** A library (e.g., Marked.js or similar) or custom logic will be used to parse and render the streamed Markdown outline in the UI for better readability.
-   **Two-Stage Generation:**
    1.  *Outline Generation:* Enhances prompt, **streams** response, **renders as Markdown**.
    2.  *Code Generation:* Generates HTML/CSS/JS from the approved outline.
-   **Rendering:**
    -   Initial preview potentially still uses `iframe` with `srcdoc`.
    -   **Full-Frame Preview:** Transition to a view where the generated website takes up the majority/entire viewport, hiding other SimAddict UI elements.
    -   **Overlay Controls:** Buttons (Save, Back) are positioned over the full-frame preview.
-   **Blob and Object URL for Saving:** Standard technique for downloading the generated HTML.

## Component Relationships (Conceptual - v1.1)

```mermaid
graph TD
    subgraph SimAddictUI [SimAddict Main UI (Step-by-Step)]
        direction TB
        APIConfig[API Config Section (Collapsible)] --> PromptInput[Prompt Input Section]
        PromptInput --> OutlineReview[Outline Review Section (Markdown, Streaming)]
        OutlineReview --> WebsitePreviewInitial[Website Preview (iframe)]
        WebsitePreviewInitial --> TriggerFullFrame{Transition to Full Frame}
    end

    SimAddictUI -->|Input/Events| JS(script.js)
    JS -->|Save/Load/Delete| LS[localStorage]
    JS -->|Call API (Stream)| FetchAPIStream{Fetch API (SSE)}
    JS -->|Call API (Standard)| FetchAPIStandard{Fetch API (Req/Res)}

    FetchAPIStream -->|Request| UserAPI[User-Provided API Endpoint]
    UserAPI -->|Stream Response| FetchAPIStream
    FetchAPIStream -->|Data Chunks| JS

    FetchAPIStandard -->|Request| UserAPI
    UserAPI -->|Response| FetchAPIStandard
    FetchAPIStandard -->|Data| JS

    JS -->|Update UI Sections| SimAddictUI
    JS -->|Render Markdown| OutlineReview
    JS -->|Render iframe| WebsitePreviewInitial
    JS -->|Control Visibility| SimAddictUI
    JS -->|Show/Hide| FullFrameView[Full Frame Preview Container]
    JS -->|Render Full Frame| FullFrameView
    JS -->|Generate Download| BrowserDL[Browser Download Mechanism]

    FullFrameView -- Contains --> OverlayControls[Overlay Buttons (Save, Back)]
    OverlayControls -->|Events| JS
```

## Data Flow (Simplified - v1.1)

1.  **Config:** User interacts with collapsible config UI -> JS saves/loads/deletes profiles in `localStorage`.
2.  **Outline:** User enters prompt -> JS gets prompt & API details -> JS calls Fetch API (Enhance Prompt, **Streaming Enabled**) -> JS receives **SSE chunks** -> JS **accumulates & renders Markdown** in UI -> Outline Review section updated progressively.
3.  **Generation:** User approves outline -> JS gets outline & API details -> JS calls Fetch API (Generate Code, Standard Req/Res) -> JS receives code -> JS parses & combines code -> JS updates UI (`iframe.srcdoc` initially).
4.  **Preview Transition:** JS hides main UI sections -> JS shows **Full Frame Preview** container (potentially moving/resizing iframe or using a different method) -> JS shows **Overlay Controls**.
5.  **Save/Back:** User clicks overlay button -> JS triggers download or transitions back to main SimAddict UI.
