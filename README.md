# AI PC Planner 🔥

An AI-powered PC build recommendation tool for the Philippines. Answer a few questions about your needs and budget, and get personalized component recommendations with real-time Philippine prices.

## Features

- **AI-Powered Recommendations** - Uses OpenRouter with Gemini 2.0 Flash to find current prices from Philippine retailers (Lazada, Shopee, PC Hub, DynaQuest, etc.)
- **Budget-Aware** - Strict budget adherence with intelligent component selection
- **Reuse Existing Parts** - Mark components you already own to exclude them from recommendations
- **Shopping Links** - Direct links to purchase components from local stores
- **Retry Logic** - Automatic retries with exponential backoff for API reliability

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: OpenRouter (google/gemini-2.0-flash-001)
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- OpenRouter API Key ([Get one here](https://openrouter.ai/keys))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-pc-planner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Add your OpenRouter API key to `.env.local`:

```env
OPENROUTER_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

### Testing UI

Visit [http://localhost:3000/mock](http://localhost:3000/mock) to preview the build result UI with sample data (no API calls).

## Project Structure

```
├── app/
│   ├── api/recommend/     # AI recommendation endpoint
│   ├── mock/              # Mock page for UI testing
│   └── page.tsx           # Main app page
├── components/
│   ├── build-result.tsx   # Displays recommended build
│   ├── loader.tsx         # Loading animation with progress
│   ├── pc-planner.tsx     # Main planner component
│   ├── quiz-form.tsx      # Configuration quiz
│   └── ui/                # shadcn/ui components
└── lib/
    ├── types.ts           # TypeScript types & constants
    └── utils.ts           # Utility functions
```

## Configuration

The quiz allows users to configure:

- **Budget** (₱20,000 - ₱300,000)
- **Primary Use** (Gaming, Productivity, Content Creation, etc.)
- **Performance Priority** (Raw FPS, Balanced, Efficiency)
- **Target Resolution** (1080p, 1440p, 4K)
- **Refresh Rate** (60Hz, 144Hz, 240Hz+)
- **Brand Preferences** (CPU: AMD/Intel, GPU: NVIDIA/AMD)
- **Existing Parts** to reuse

## License

MIT
