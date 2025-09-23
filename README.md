# YoBaeXo Music Brand Website

A complete production-ready music brand website for YoBaeXo built with React, TypeScript, and Tailwind CSS. Features dark-neon styling, mobile-first design, and comprehensive integrations.

## 🎵 Features

- **8 Complete Pages**: Home, Albums, Licensing, Donate, Remix, EPK, Contact, Privacy
- **Dark-Neon Design**: Professional aesthetic with magenta, cyan, and violet accents
- **Mobile-First**: Fully responsive design optimized for all devices
- **SEO Optimized**: Meta tags, OpenGraph, structured data, and performance optimized
- **Accessibility**: WCAG compliant with proper focus states and semantic HTML

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Fonts**: Poppins (headings), Inter (body text)

## 🔗 Integrations Ready

### Payment Processing (Stripe)
- Test keys configured: `pk_test_replace_with_live_key`
- Pricing IDs ready for replacement:
  - Basic License: `price_test_basic_replace`
  - Pro License: `price_test_pro_replace`
  - Commercial License: `price_test_commercial_replace`

### Webhooks
- Forms submit to: `https://hooks.zapier.com/hooks/catch/0000000/AAAAAAA`
- Ready for contact forms, licensing requests, and donations

### Analytics
- Google Analytics 4 placeholder: `G-XXXXXXXXXX`

### Social/Streaming Links
All placeholder links included for:
- YouTube: `@YoBaeXo`
- Apple Music, Amazon Music, Audiomack, Anghami, iHeart, Last.fm
- Instagram, Twitter

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx          # Sticky navigation with mobile menu
│   └── Footer.tsx          # 4-column footer with links
├── pages/
│   ├── Home.tsx           # Hero, featured albums, about
│   ├── Albums.tsx         # Filterable album grid
│   ├── Licensing.tsx      # Pricing tiers & Stripe integration
│   ├── Donate.tsx         # Support options with payments
│   ├── Remix.tsx          # YouTube, Audiomack, Instagram embeds
│   ├── EPK.tsx            # Press kit downloads & info
│   ├── Contact.tsx        # Contact form with webhook
│   └── Privacy.tsx        # Privacy policy
├── App.tsx                # Main app with routing
├── main.tsx              # App entry point
└── index.css             # Global styles & animations
```

## 🎨 Design System

### Colors
- **Background**: `#0b0b12` (gray-950), `#12121a` (gray-900)
- **Neon Accents**: 
  - Pink: `#ec4899`
  - Cyan: `#06b6d4` 
  - Violet: `#8b5cf6`
- **Text**: `#e5e7eb` (gray-200)

### Typography
- **Headings**: Poppins (400-800 weight)
- **Body**: Inter (300-700 weight)
- **Line Height**: 150% body, 120% headings

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## ⚙️ Configuration Needed

### 0. YouTube API Setup
To display your actual YouTube videos on the Albums page:

1. **Get YouTube API Key**:
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Restrict the key to YouTube Data API v3 for security

2. **Get Channel ID**:
   - Go to your YouTube channel
   - View page source and search for "channelId" or use online tools
   - Or use: `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=YoBaeXo&key=YOUR_API_KEY`

3. **Configure API**:
   ```bash
   # Create .env file from example
   cp .env.example .env
   
   # Edit .env file with your credentials
   VITE_YOUTUBE_API_KEY=your_actual_api_key
   VITE_YOUTUBE_CHANNEL_ID=your_actual_channel_id
   ```

   Or directly edit `src/services/youtube.ts`:
   ```typescript
   this.apiKey = 'your_actual_api_key';
   this.channelId = 'your_actual_channel_id';
   ```

### 1. Replace Stripe Keys
In `src/pages/Licensing.tsx` and `src/pages/Donate.tsx`:
```javascript
// Replace test key with live key
const stripe = Stripe('pk_live_your_actual_key');

// Replace pricing IDs
priceId: 'price_live_actual_id'
```

### 2. Update Webhook URLs
In contact and form components:
```javascript
// Replace with your actual webhook URL
const webhookUrl = 'https://your-webhook-service.com/endpoint';
```

### 3. Add Analytics Tracking
In `index.html`:
```html
<!-- Replace with your GA4 tracking ID -->
gtag('config', 'G-YOUR_ACTUAL_TRACKING_ID');
```

### 4. Update Social Links
In `src/components/Footer.tsx` and throughout:
- Replace placeholder URLs with actual social media profiles
- Update streaming platform links

### 5. Replace Sample Data
In `src/pages/Albums.tsx` and `src/pages/Home.tsx`:
- Replace sample album data with actual releases
- Update cover art URLs with actual images
- Replace YouTube video IDs with real content

## 📱 Pages Overview

### Home (`/`)
- Hero section with logo and CTAs
- Featured albums grid (6 items)
- About section with YouTube embed

### Albums (`/albums`)
- Filterable grid with search, genre, year filters
- Album cards with preview capabilities
- Responsive masonry layout

### Licensing (`/licensing`)
- 3 pricing tiers (Basic ₹999, Pro ₹2,999, Commercial custom)
- Stripe integration for instant purchases
- Custom licensing request form

### Donate (`/donate`)
- Quick tip options (₹99, ₹299, ₹499, ₹999)
- Custom donation form with Stripe
- Donor messaging system

### Remix (`/remix`)
- YouTube playlist gallery
- Audiomack profile integration
- Instagram Reels showcase

### EPK (`/epk`)
- Artist bio and statistics
- Downloadable press materials
- One-sheet media kit

### Contact (`/contact`)
- Multi-category contact form
- Quick action links
- FAQ section

### Privacy (`/privacy`)
- Comprehensive privacy policy
- GDPR compliance ready
- Contact information for privacy inquiries

## 🔧 Deployment Ready

The website is production-ready with:
- ✅ Minified assets and optimized images
- ✅ SEO meta tags and structured data
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Mobile-first responsive design
- ✅ Performance optimized (lazy loading, caching)
- ✅ Cross-browser compatibility

## 📄 License

This project is built for YoBaeXo. All design and content rights reserved.

---

**Ready to go live!** Just replace the placeholder data and integrations with your actual services and content.