# Project Brief: SimAddict

## Core Goal (v1.1 Enhancements)

To enhance the "SimAddict" local webpage application with improved UI/UX, features, and presentation:
1.  **API Profiles:** Configure, save, load, and **delete** profiles (URL, Key, Model ID) using `localStorage`. Make the configuration section collapsible if profiles exist.
2.  **Prompt Input:** Input a prompt describing a desired website.
3.  **Outline Generation (Streaming & Markdown):** Utilize the configured AI profile to enhance the prompt into a detailed requirements/outline, **streaming** the response and **parsing/rendering it as Markdown**.
4.  **Outline Review:** Review and optionally edit the generated outline.
5.  **Website Generation:** Approve the outline to trigger AI generation of a complete, single-page website (HTML, CSS, JavaScript).
6.  **Website Preview (Full Frame):** Display the generated website dynamically, initially in an iframe, then transitioning to a **full-frame view** upon completion.
7.  **Saving & Navigation (Overlay):** Provide **overlay buttons** on the full-frame preview to save the generated website code or return to the main SimAddict interface.
8.  **Mobile-Friendly Flow:** Structure the UI sections (API Config, Prompt, Outline, Preview) to appear sequentially ("step-by-step tiles") for better usability on smaller screens.

## Key Features (v1.1)

-   BYO API Key/Endpoint configuration and profile management (Save, Load, **Delete**).
-   **Collapsible API configuration** section.
-   Two-stage AI generation: Prompt Enhancement -> Website Code Generation.
-   **Streaming** response for outline generation.
-   **Markdown rendering** for the generated outline.
-   User review and editing step for the enhanced prompt/outline.
-   Dynamic website rendering, transitioning to **full-frame preview**.
-   **Overlay controls** (Save, Back) on the preview.
-   **Step-by-step UI flow** for improved mobile experience.
-   Website code saving functionality.
-   Local operation (runs entirely in the user's browser).
