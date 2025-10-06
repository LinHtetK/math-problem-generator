# SupaBase Url & Anon key

- **SubaBaseUrl** = https://ysocjgxmcxhsadisfiab.supabase.co
- **Anon Key** = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb2NqZ3htY3hoc2FkaXNmaWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjE0NzIsImV4cCI6MjA3NTIzNzQ3Mn0.6I9sNzlCkCDnWoQft4OYJSeNKssZod7kBEPuTnOKnWc

# Implementation Notes

# My Implementation:

I built a fully responsive Math Problem Generator using Next.js (App Router), React, and Tailwind CSS. The app lets users generate math problems via an API, input answers, and get instant feedback — all in a clean, mobile-friendly UI.

# Key Design Decisions:

- Leveraged React hooks (useState) for state management and seamless user interactions.

- Used Tailwind CSS for styling, taking advantage of its utility-first approach and responsive breakpoints for an adaptive layout.

- Focused on accessibility and feedback clarity, using color-coded messages and accessible components.

- Adopted a minimalist card-based design, emphasizing simplicity and readability.

# Challenges:

- Tailwind initially didn’t detect utility classes due to a src/ directory structure — resolved by updating the content paths in tailwind.config.ts.

- Debugged PostCSS integration and ensured that globals.css imported Tailwind layers correctly.

- Fine-tuned responsive spacing and text scaling to maintain a consistent design across screen sizes.

# Highlights:

- Responsive layout that scales gracefully from small to large screens.

- Smooth transitions, rounded UI elements, and color consistency.

- Robust error handling and clear feedback system.

- Type-safe and clean codebase with strong React + TypeScript patterns.
