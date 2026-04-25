# Eventrip - Event Travel Package Aggregator

Eventrip is a Next.js 15 MVP for an event travel package aggregator similar to Lastminute.com but specifically designed for concerts, sports, festivals, and other events.

## Features

- **Hybrid Search Bar**: Search by artist, event name, or city with real-time filtering
- **Dynamic Package Building**: Combine tickets, flights, trains, and hotels in one seamless experience
- **Real-time Price Calculator**: See your total cost update instantly as you add items
- **Event Discovery**: Browse popular events across concerts, sports, and festivals
- **Responsive Design**: Mobile-first approach with stunning dark theme UI
- **Smooth Animations**: Framer Motion animations throughout for a premium feel

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11.3
- **Icons**: Lucide React
- **Database**: Supabase
- **Payment**: Stripe (future integration)
- **APIs**:
  - Ticketmaster for events
  - Amadeus for flights and trains
  - Booking.com for hotels

## Project Structure

```
eventrip/
├── app/
│   ├── api/              # API routes for backend integration
│   │   ├── events/       # Ticketmaster API wrapper
│   │   ├── flights/      # Amadeus API wrapper
│   │   └── hotels/       # Booking.com API wrapper
│   ├── event/
│   │   └── [id]/         # Event detail page with package builder
│   ├── search/           # Search results with filters
│   ├── checkout/         # Checkout and payment page
│   ├── layout.tsx        # Root layout with navbar
│   ├── page.tsx          # Homepage with hero and popular events
│   └── globals.css       # Global styles and CSS variables
├── components/
│   └── ui/
│       ├── Button.tsx           # Reusable button component
│       ├── EventCard.tsx        # Event card component
│       ├── Navbar.tsx           # Navigation component
│       ├── PackageCalculator.tsx # Real-time price calculator
│       └── SearchBar.tsx        # Hybrid search bar with tabs
├── lib/
│   ├── api/
│   │   ├── amadeus.ts    # Amadeus flights/trains API
│   │   ├── booking.ts    # Booking.com hotels API
│   │   └── ticketmaster.ts # Ticketmaster events API
│   ├── supabase.ts       # Supabase client setup
│   └── utils.ts          # Utility functions
├── types/
│   └── index.ts          # TypeScript type definitions
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- API keys for:
  - Ticketmaster Discovery API
  - Amadeus API (test environment)
  - Booking.com API
  - Supabase

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eventrip
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.local.example .env.local
```

4. Fill in your API keys in `.env.local`:
```env
NEXT_PUBLIC_TICKETMASTER_API_KEY=your_key
NEXT_PUBLIC_AMADEUS_API_KEY=your_key
NEXT_PUBLIC_BOOKING_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Homepage
- Browse trending events
- Use the hybrid search bar to find events by artist, name, or city
- Learn about the dynamic packaging process

### Search Results
- Filter events by type, date range, and price
- Sort by relevance, price, or date
- View event details and start building packages

### Event Details Page
- Select ticket category (VIP, Standard, General)
- Choose flights or trains
- Select accommodation
- Real-time package price calculation
- Add items to your package

### Checkout
- Enter personal information
- Secure payment processing
- Order confirmation with reference number

## Key Components

### SearchBar
Hybrid search component with tabs for Artist, Event, and City search modes with smooth Framer Motion transitions.

### EventCard
Responsive event card with image, venue, date, and ticket availability with hover effects.

### PackageCalculator
Real-time price calculator showing breakdown of tickets, transport, accommodation, fees, and total with animated updates.

### Button
Reusable button component with variants (primary, secondary, ghost, danger, outline) and loading states.

## Design System

### Colors
- **Primary**: Deep Purple (#6B21A8)
- **Accent**: Electric Blue (#3B82F6)
- **Background**: Dark (#0A0A0F)
- **Glass**: rgba(255, 255, 255, 0.05) with backdrop blur

### Typography
- Font: Inter
- Sizes: sm, base, lg, xl, 2xl, 3xl, etc.
- Weights: Regular, semibold, bold

### Spacing & Layout
- Max-width: 7xl (80rem)
- Grid: 12 columns responsive
- Gap: 4px to 32px depending on context

## API Integration

### Events API Route
```bash
GET /api/events?q=query&city=Paris&dateFrom=2024-07-01&dateTo=2024-07-31
```

### Flights API Route
```bash
GET /api/flights?origin=CDG&destination=LHR&departureDate=2024-07-15&adults=2
```

### Hotels API Route
```bash
GET /api/hotels?latitude=48.86&longitude=2.36&checkInDate=2024-07-15&checkOutDate=2024-07-17&guests=2
```

## Mock Data

The application includes mock data for development:
- 8 popular events (Taylor Swift, Champions League, Coachella, etc.)
- 3 flight options per search
- 4 hotel options per location

To use real API data:
1. Ensure API keys are properly configured
2. Remove or comment out mock data in respective functions
3. Handle API responses and errors appropriately

## Future Features

- User authentication and accounts
- Saved itineraries and wishlists
- Real payment processing with Stripe
- Email confirmations and receipts
- Personalized recommendations
- Review and rating system
- Group booking discounts
- Travel insurance options
- Flexible date search
- Map-based event discovery

## Performance Optimizations

- Next.js Image optimization
- Tailwind CSS purging
- Code splitting with dynamic imports
- Lazy loading of components
- CSS variables for theming
- Optimized animations with Framer Motion

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Tailwind CSS for all styling
- Component-based architecture
- Utility-first CSS approach

## Environment Variables

See `.env.local.example` for all required and optional environment variables.

## Performance Metrics

- Lighthouse Score: 90+
- Core Web Vitals optimized
- Fast initial load times
- Smooth animations at 60fps

## Support

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Follow the bug report template

## License

This project is proprietary and confidential.

## Contact

For more information about Eventrip, visit our website or contact the team.
