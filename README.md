# smart-speed

Smart Voice Speedup is a simple demo that turns any article into audio you can compare in two ways: a standard “baseline” text-to-speech and a “smart speed” version. The smart version automatically varies tempo based on punctuation and context, so sentences sound more natural than a flat 1.5× or 2× playback. It can also apply subtle pitch and tone changes, such as a slower, softer “bedtime” style to help listeners fall asleep. The goal is to make speed-adjusted listening clearer, smoother, and more enjoyable.

# stack info

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Next, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Next.js** - Full-stack React framework
- **Node.js** - Runtime environment
- **Biome** - Linting and formatting

## Getting Started

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
smart-speed/
├── src/
│   ├── app/       # Frontend application (Next.js)
│   └────── /api   # API route for TTS (Next)
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server
- `bun check-types`: Check TypeScript types across all apps
- `bun check`: Run Biome formatting and linting
