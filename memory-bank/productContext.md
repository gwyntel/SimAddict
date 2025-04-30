# Product Context: SimAddict

## Problem Solved

Users often have ideas for simple websites or web components but may lack the time, coding skills, or desire to build them from scratch manually. Existing AI code generation tools might require complex setup or lack a streamlined workflow for generating, previewing, and saving simple, self-contained websites locally.

## Solution (v1.1 Enhancements)

SimAddict provides an enhanced, user-friendly, local web interface designed for a smooth, step-by-step workflow, particularly on mobile devices. It allows users to leverage powerful AI models via their own API keys/endpoints (which can be saved, loaded, and deleted) in a structured, two-step process:
1.  **Idea Refinement (Streaming & Markdown):** The AI helps transform a basic idea into a clearer set of requirements and an outline. This outline is **streamed** to the user in real-time and rendered using **Markdown** for better readability, ensuring alignment before code generation.
2.  **Code Generation & Full Preview:** The AI generates the full HTML, CSS, and JS based on the approved outline. The generated site is rendered dynamically, transitioning to a **full-frame preview** with overlay controls for saving or returning to the main interface.

This empowers users to quickly prototype and generate functional websites directly from prompts, with improved control over profiles, a more interactive generation process, and a better preview experience. The API configuration section is collapsible once profiles are saved, reducing clutter.

## Target User

Individuals (developers, designers, hobbyists) who want a quick, interactive, and mobile-friendly way to generate simple, single-page websites or web components using AI, running entirely within their browser.

## User Experience Goals (v1.1)

-   **Simplicity & Flow:** Easy-to-understand, **step-by-step interface** suitable for various screen sizes. **Collapsible configuration** reduces initial complexity.
-   **Control:** Users manage their own API profiles (save, load, **delete**) and can review/edit the AI's plan.
-   **Interactivity & Speed:** **Streaming** outline generation provides immediate feedback. Rapid generation from prompt to full preview.
-   **Clarity:** **Markdown rendering** improves outline readability.
-   **Immersive Preview:** **Full-frame preview** with convenient **overlay controls**.
-   **Portability:** Generated websites are saved as standard `.html` files.
