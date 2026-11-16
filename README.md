////////////////////////////////////////////////

This is for MVP, still in progress!!!

////////////////////////////////////////////////

# PromptForge

An AI prompt optimizer that turns rough instructions into structured, clearer prompts with practical improvement notes.

## Features

- Prompt optimization
- Task and target-assistant selection
- Copy-ready improved prompts
- Local prompt history
- Demo mode without an API key

## Requirements

- Node.js 18 or newer
- An OpenAI API key for live AI responses (optional for demo mode)

## Run locally

```bash
npm install
cp .env.example .env
```

Add your API key to `.env`:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
PORT=3000
```

Start the application:

```bash
npm start
```

Open **http://localhost:3000**.

If `OPENAI_API_KEY` is blank, the app uses a clearly labeled demo response. Add a key to enable live AI processing.

## API

- `GET /api/health`
- `POST /api/optimize`

## Project structure

```text
promptforge-ai/
├── public/          # Standalone frontend
├── server/
│   └── index.js     # Express API and AI integration
├── docs/
│   └── GITHUB_BACKLOG.md
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Security and deployment notes

- The OpenAI API key is read only by the server; never expose it in browser JavaScript.
- This is an MVP starter, not a production-hardened service.
- Before public deployment, add authentication if needed, rate limiting, request logging, usage limits, monitoring, and a privacy/data-retention policy.
- Do not commit `.env` or secrets.
- Review all AI output before relying on it.

## GitHub

See [`docs/GITHUB_BACKLOG.md`](docs/GITHUB_BACKLOG.md) for proposed Issues and Discussions.
