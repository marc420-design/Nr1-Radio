# NR1 DNB Radio — Web Application

**Live at:** [listen-nr1dnb.com](https://listen-nr1dnb.com)

Norwich's underground drum & bass radio station. Live Friday sessions, 24/7 stream, 30+ DJs. Est. 2018.

---

## 🎵 Features

- **Live Streaming**: 320kbps MP3 stream with real-time now-playing updates via Server-Sent Events
- **Smart Speaker Integration**: Alexa voice commands and TuneIn compatibility
- **Progressive Web App**: Install on mobile devices for an app-like experience
- **Media Session API**: Lock screen controls and metadata on mobile devices
- **Weekly Schedule**: View upcoming live shows and guest mixes
- **Events Calendar**: Stay updated on NR1 appearances and events
- **DJ Profiles**: Meet the crew - resident DJs and guest artists
- **Responsive Design**: Mobile-first layout that works beautifully on all devices

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) with React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Radio Backend**: [AzuraCast](https://www.azuracast.com/) radio automation
- **Database**: [Supabase](https://supabase.com/) PostgreSQL
- **Deployment**: [Vercel](https://vercel.com/)
- **Analytics**: [Umami](https://umami.is/) (self-hosted, GDPR-friendly)
- **Testing**: [Vitest](https://vitest.dev/) + React Testing Library

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- AzuraCast instance (for radio streaming)
- Supabase project (for schedule/events/DJs data)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/marc420-design/Nr1-Radio.git
   cd nr1-radio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   ```env
   # AzuraCast
   NEXT_PUBLIC_AZURACAST_BASE_URL=https://your-azuracast-host.com
   NEXT_PUBLIC_STATION_ID=your_station_shortcode
   NEXT_PUBLIC_STATION_SHORTCODE=your_station_shortcode

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Analytics (optional)
   NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-umami-website-id
   ```

4. **Set up Supabase database**

   Run the SQL schema in your Supabase SQL editor:

   ```bash
   # The schema is in supabase-schema.sql
   # This creates tables for: schedule, djs, events
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
nr1-radio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Homepage with player
│   │   ├── schedule/          # Weekly show schedule
│   │   ├── events/            # Upcoming events
│   │   ├── djs/               # DJ profiles
│   │   ├── about/             # Station history
│   │   ├── listen/            # Multi-platform listening guide
│   │   ├── api/               # API routes (proxies for AzuraCast)
│   │   ├── error.tsx          # Error boundary
│   │   └── layout.tsx         # Root layout with nav/footer
│   ├── components/
│   │   ├── player/            # Audio player components
│   │   ├── ui/                # Shared UI components
│   │   └── ErrorBoundary.tsx  # React error boundary
│   ├── hooks/
│   │   ├── useAudioStream.ts  # Audio playback with retry logic
│   │   ├── useNowPlaying.ts   # Real-time track updates
│   │   └── useMediaSession.ts # Lock screen controls
│   ├── lib/
│   │   ├── azuracast.ts       # AzuraCast API client
│   │   ├── supabase.ts        # Supabase client
│   │   ├── constants.ts       # App constants
│   │   └── station.ts         # Station metadata
│   └── globals.css            # Global styles & animations
├── public/
│   ├── icons/                 # PWA icons
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── robots.txt             # SEO robots file
├── vitest.config.ts           # Vitest configuration
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies & scripts
```

---

## 🎨 Design System

### Colors

- **Primary**: Cyan `#00E5FF` - Interactive elements, live indicators
- **Secondary**: Crimson `#FF2D55` - Alerts, live status
- **Background**: Near-black `#070709` - Main background
- **Grey**: `#1A1A1A` - Cards, panels
- **Muted**: `#888888` - Secondary text

### Typography

- **Headings**: Bebas Neue (uppercase, wide tracking)
- **Monospace**: Space Mono (status, metadata)
- **Body**: DM Sans (readable, modern)

### Motion

- Subtle animations: pulsing live dot, equalizer bars
- No heavy animations to maintain performance
- Smooth transitions on hover/active states

---

## 🧪 Testing

Run tests with Vitest:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Tests are located in `src/**/__tests__/` directories.

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**

2. **Set environment variables in Vercel dashboard**
   - Add all variables from `.env.local`
   - Ensure `NEXT_PUBLIC_AZURACAST_BASE_URL` uses HTTPS

3. **Deploy**
   ```bash
   git push origin main
   ```
   Vercel will automatically build and deploy.

### Custom Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📡 AzuraCast Configuration

### CORS Setup

In your AzuraCast instance, configure CORS to allow requests from your domain:

1. Go to **Administration** → **System Settings**
2. Add `listen-nr1dnb.com` to allowed origins
3. Enable CORS for API endpoints

### Stream URL

The direct stream URL format:
```
https://your-azuracast-host.com/listen/{station_shortcode}/radio.mp3
```

---

## 🗄️ Supabase Schema

The app uses three main tables:

### `schedule`
Weekly show schedule with day/time slots.

### `djs`
DJ profiles with bios, photos, and social links.

### `events`
Upcoming events with flyers, dates, and ticket links.

All tables have Row Level Security (RLS) enabled with public read access.

---

## 🔊 Smart Speaker Integration

### Alexa

**Primary phrase**: "Alexa, play NR1 Drum and Bass Radio"  
**Alternate**: "Alexa, play NR1 DNB"

Requires:
1. TuneIn listing approval
2. Alexa Radio Skills Kit submission

### TuneIn

Submit your station at: [broadcasters.tunein.com](https://broadcasters.tunein.com/)

Required info:
- Station name
- Stream URL
- Genre
- Location
- Logo (1200×1200px)

---

## 📊 Analytics

The app uses Umami for privacy-friendly analytics:

- No cookies
- No personal data collection
- GDPR compliant
- Self-hosted option

Set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in your environment variables.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary to NR1 DNB Radio.

---

## 🔗 Links

- **Website**: [listen-nr1dnb.com](https://listen-nr1dnb.com)
- **Facebook**: [facebook.com/nr1dnb](https://www.facebook.com/nr1dnb)
- **YouTube**: [@nr1family420](https://youtube.com/@nr1family420)
- **Mixcloud**: [mixcloud.com/Nr1family](https://www.mixcloud.com/Nr1family/)
- **SoundCloud**: [soundcloud.com/nr1-family](https://soundcloud.com/nr1-family)
- **Email**: Nr1family420@gmail.com

---

## 💙 In Memory

This project is dedicated to the memory of **Jonny 2 Bad (J2B)**, a founding member of NR1 DNB Radio who passed away in 2023. His passion for drum & bass and his contributions to the Norwich music scene will never be forgotten.

**R.I.P. Brother** 🎵

---

Built with ❤️ by the NR1 family in Norwich, UK.
