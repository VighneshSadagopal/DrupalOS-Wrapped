# DrupalOS Wrapped

A personalized Year-in-Review experience for Drupal.org contributors.

This project generates a "Spotify Wrapped" style summary for Drupal developers, visualizing their contributions, community impact, and journey throughout the year. It uses AI to analyze profile data and present it in an engaging, story-like format.

## Features

- **Personalized Insights**: detailed stats on issues, commits, and role in the community.
- **Story Format**: Instagram-story style visualization of user data.
- **AI-Powered Analysis**: Uses Google Gemini to extract and interpret unstructured profile data.
- **Shareable Cards**: Generate image cards to share your achievements on social media.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [React 19](https://react.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI**: [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- **Database**: [Supabase](https://supabase.com/)
- **Scraping**: [Jina AI](https://jina.ai/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd DrupalOS-Wrapped
   ```

2. Create a `.env` file in the root directory and add your API keys:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: Contact the maintainer or check project documentation for other required environment variables if applicable.*

### Installation

Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running the Development Server

Start the local development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [Drupal.org API](https://www.drupal.org/drupalorg/docs/apis)
- [Next.js Documentation](https://nextjs.org/docs)
