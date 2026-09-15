# MedCoach — Free Medical School Interview Coach

This is a completely free, browser-only medical school interview practice website.

## Features
- Traditional, Behavioral, MMI, Ethics, Group, Panel, and Application Deep Dive modes
- Core 7 medical school interview questions
- MMI station categories
- Microphone recording and playback
- Browser speech recognition when supported
- Transcript-based delivery analysis
- Filler/hedging detection
- Repeated-word detection
- Basic professionalism, empathy, teamwork, and ethics red-flag detection
- Specific-example coaching ("show, don't just tell")
- Follow-up question simulation
- Application deep-dive question generation from text you paste
- Interviewer question bank
- LocalStorage progress tracking
- No backend, no paid API, no database

## Run locally
1. Unzip the folder.
2. Double-click `index.html`, OR run:
   `python3 -m http.server 8000`
3. Open `http://localhost:8000`.
4. Use Chrome or another browser with microphone support.
5. Allow microphone permission.

## Publish on GitHub Pages
1. Create a new GitHub repository, e.g. `medcoach`.
2. Upload `index.html`, `style.css`, and `app.js` to the repository root.
3. Go to Settings → Pages.
4. Under Build and deployment, select Deploy from a branch.
5. Select `main` and `/ (root)`, then Save.
6. Wait for GitHub Pages to deploy.
7. Your site will be available at the Pages URL shown by GitHub.

## Important free-version limitation
This site does not use generative AI. The feedback is rule-based JavaScript analysis. It can detect patterns and coach structure, but it cannot reliably judge subtle tone, clinical nuance, facial expressions, or whether an answer is truly compelling.

Browser speech recognition behavior varies by browser and may use the browser vendor's speech service. The site itself has no server or API and does not upload recordings.

## Content philosophy
The coach incorporates these principles:
- Specific examples are stronger than unsupported traits.
- Use situation → action → result → reflection.
- Prepare the core seven questions.
- Expect application-specific follow-ups.
- MMI evaluates reasoning, stakeholders, empathy, and nuance rather than a magic answer.
- In group interviews, contribute without dominating and avoid passivity.
- Stay composed when challenged.
- Ask thoughtful school-focused and interviewer-focused questions.
- Interview day is also an opportunity to evaluate the school.
