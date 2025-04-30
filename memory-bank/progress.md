# Progress: SimAddict (In Progress - v1.1)

## Current Status

-   v1.0 core functionality was successfully implemented.
-   Memory Bank files have been updated to reflect v1.1 requirements.
-   Beginning implementation of v1.1 enhancements.

## What Works (v1.0)

-   **API Profile Management:** Users can save API endpoint details (URL, Key, Model ID) under a profile name to `localStorage` and load saved profiles using a dropdown.
-   **Outline Generation:** Users can input a prompt, and upon clicking "Generate Outline", the application calls the configured AI endpoint to generate requirements/outline, which is displayed.
-   **Outline Editing/Approval:** Users can view the generated outline, optionally edit it in a textarea, and approve the final version.
-   **Website Generation:** Approving the outline triggers another AI call to generate the full website code (HTML with embedded CSS/JS).
-   **Website Preview:** The generated website code is rendered dynamically within an `<iframe>`.
-   **Website Saving:** Users can click "Save Website Code" to download the complete generated HTML file.
-   **Basic UI:** Sections are visually distinct with basic styling.
-   **Error Handling:** Basic error handling for missing inputs and API call failures is included (alerts and console logs).

## What's Being Implemented (v1.1)

-   **Profile Deletion:** Adding the ability to delete saved API profiles.
-   **Collapsible API Config:** Making the API configuration section collapsible, especially when profiles exist.
-   **Step-by-Step UI Flow:** Modifying the interface to show only one main section at a time for better mobile experience.
-   **Markdown Rendering:** Integrating a Markdown library to render the outline with better formatting.
-   **Streaming Outline Generation:** Implementing SSE handling to stream and display the outline progressively.
-   **Full-Frame Preview & Overlay Controls:** Creating a full-screen preview mode with overlay buttons for saving and navigation.

## Implementation Progress (v1.1)

-   **Profile Deletion:** Completed
-   **Collapsible API Config:** Completed
-   **Step-by-Step UI Flow:** Completed
-   **Markdown Integration:** Completed
-   **Streaming Outline Generation:** Completed
-   **Full-Frame Preview & Overlay:** Completed

## Known Issues

-   API keys are stored in `localStorage`, which has security implications if the user's system is compromised. (Documented in `techContext.md`).
-   Relies heavily on the AI correctly formatting the output (both outline and final code). Parsing is basic.
-   No explicit handling for very large generated websites that might strain the browser or `srcdoc`.
