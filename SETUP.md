# Eventrip Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd /sessions/elegant-happy-dirac/mnt/eventrip
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
- **Ticketmaster**: Get from https://developer.ticketmaster.com
- **Amadeus**: Get from https://developers.amadeus.com
- **Booking.com**: Get from https://partner.booking.com
- **Supabase**: Create project at https://supabase.com

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Project Files Overview

### Core Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS theme with Eventrip colors
- `next.config.ts` - Next.js configuration with image domains
- `postcss.config.js` - PostCSS plugins

### Styling
- `app/globals.css` - Global styles, CSS variables, animations
- Uses Tailwind CSS utility-first approach
- Custom glass-morphism effects
- Gradient text and glow effects

### Pages & Routes

#### Public Pages
- `app/page.tsx` - Homepage with hero, search bar, popular events, how-it-works
- `app/search/page.tsx` - Search results with filters (type, date, price)
- `app/event/[id]/page.tsx` - Event detail with 3-step package builder
- `app/checkout/page.tsx` - Checkout form with payment section

#### API Routes
- `app/api/events/route.ts` - Ticketmaster integration endpoint
- `app/api/flights/route.ts` - Amadeus flights integration endpoint
- `app/api/hotels/route.ts` - Booking.com hotels integration endpoint

### Components
- `components/ui/Button.tsx` - Reusable button (5 variants, 3 sizes)
- `components/ui/Navbar.tsx` - Navigation with mobile menu
- `components/ui/SearchBar.tsx` - Hybrid search (Artist/Event/City tabs)
- `components/ui/EventCard.tsx` - Event card with animations
- `components/ui/PackageCalculator.tsx` - Real-time price calculator

### Libraries
- `lib/utils.ts` - Utility functions (formatPrice, formatDate, etc.)
- `lib/supabase.ts` - Supabase client and DB functions
- `lib/api/ticketmaster.ts` - Ticketmaster API client
- `lib/api/amadeus.ts` - Amadeus API client for flights/trains
- `lib/api/booking.ts` - Booking.com API client

### Types
- `types/index.ts` - All TypeScript interfaces

## Design Highlights

### Color Scheme
```
Primary:   #6B21A8 (Deep Purple)
Accent:    #3B82F6 (Electric Blue)
Dark:      #0A0A0F (Very Dark)
Glass:     rgba(255, 255, 255, 0.05) + backdrop blur
```

### Key Features Implemented
✓ Spectacular hero section with gradient overlay
✓ Hybrid search bar with 3 tabs and smooth transitions
✓ Glassmorphism cards throughout
✓ Framer Motion animations on all interactive elements
✓ Real-time package price calculator with animated updates
✓ 3-step event package builder (tickets, transport, hotel)
✓ Advanced filtering system (type, date, price)
✓ Responsive grid layouts (1/2/3 columns)
✓ Trust badges and security indicators
✓ Mobile-first responsive design

## Testing the App

### Homepage Flow
1. Navigate to http://localhost:3000
2. Try the search bar with different tabs
3. Browse popular events section
4. Click "Créer un Pack" on any event

### Search Results
1. Use the search functionality
2. Test filters on the left sidebar
3. Click an event to go to details

### Event Details
1. Select ticket category
2. Add flights from options
3. Select a hotel
4. Watch price calculator update
5. Click "Réserver ce Pack"

### Checkout
1. Fill in personal info
2. Enter test card: 4242 4242 4242 4242
3. Submit form (uses mock processing)
4. View confirmation page

## Development Notes

### Mock Data
The app includes comprehensive mock data for development:
- 8 popular events with real-looking details
- 3 flight options per search
- 4 hotel options with images and ratings
- Realistic pricing and availability

### No Real Payments
The checkout page simulates payment processing - no actual charges occur.

### API Integration Ready
All API clients are implemented and ready for real API keys:
- Ticketmaster events search
- Amadeus flights and trains
- Booking.com hotels
- Supabase database

### Production Checklist
- [ ] Set up Supabase database schema
- [ ] Configure real API credentials
- [ ] Implement Stripe payment processing
- [ ] Set up email notifications
- [ ] Configure authentication
- [ ] Add error logging and monitoring
- [ ] Set up CI/CD pipeline
- [ ] Optimize images and assets
- [ ] Configure CDN for static files
- [ ] Set up analytics tracking
- [ ] Implement rate limiting
- [ ] Add API request caching

## Troubleshooting

### Port 3000 in use
```bash
npm run dev -- -p 3001
```

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind not applying
Check that `globals.css` is imported in `layout.tsx` and Tailwind classes are in JSX.

### API errors
1. Check .env.local has correct API keys
2. Verify API keys have proper permissions
3. Check network tab in DevTools for request/response
4. Fall back to mock data is still available

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t eventrip .
docker run -p 3000:3000 eventrip
```

### Manual (Node.js)
```bash
npm run build
npm start
```

## Resources

- Next.js 15 Docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- TypeScript: https://www.typescriptlang.org
- Supabase: https://supabase.com/docs
- Lucide Icons: https://lucide.dev

## Support

For issues or questions, check the README.md or reach out to the development team.
