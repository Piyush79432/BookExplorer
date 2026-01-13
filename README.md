# 📚 BookExplorer | Full-Stack Live Scraper & Discovery Engine

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**BookExplorer** is a production-grade discovery platform that leverages live web scraping to provide real-time pricing, inventory, and deep technical specifications. It bridges the gap between static e-commerce and live data analysis.

---

## 🚀 Quick Setup & Execution

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (Running instance)
- **Backend Environment** (Python/FastAPI or Node.js/Express)

### Environment Variables

| Component | Variable | Value |
| :--- | :--- | :--- |
| **Frontend** | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001` |
| **Backend** | `PORT` | `3001` |
| **Backend** | `DATABASE_URL` | `postgresql://user:pass@localhost:5432/wob_explorer` |

### Installation Steps

**1. Backend Setup**

```bash
cd backend
npm install  # or: pip install -r requirements.txt
npm run dev  # or: python main.py
```

**2. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

**3. Access the Application**

Visit [http://localhost:3000](http://localhost:3000) to explore BookExplorer.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19 with shadcn/ui (50+ pre-built components)
- **Styling**: Tailwind CSS 4 with custom animations
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: Sonner & custom Toast
- **Charts**: Recharts
- **Additional**: Date-fns, Embla Carousel, React Resizable Panels

### Backend
- **Runtime**: Node.js (Express) or Python (FastAPI)
- **Database**: PostgreSQL
- **Scraping**: Selenium or BeautifulSoup
- **Data Processing**: Custom normalization pipeline

---

## ✨ System Architecture & Logic

### 🔍 Deep Scrape Engine

The app triggers a secondary scrape on product selection to extract comprehensive data:

- **Summaries**: Full book descriptions and plot outlines
- **Specs**: ISBN, Publisher, Binding type, and Weight
- **Reviews**: Real-time user feedback and ratings from multiple sources
- **Pricing**: Live price aggregation across retailers

### 🕒 History Tracking System

A custom event-driven system ensures the UI stays in sync with user actions:

1. **Save**: `addToHistory(id)` updates the browser's localStorage
2. **Broadcast**: `window.dispatchEvent(new Event("historyUpdated"))` notifies the app
3. **Sync**: The `HistorySection` component listens for the event and re-fetches data via `POST /history`

### 🏗️ Data Flow Architecture

```
User Input → Frontend Search → Backend Query → Live Scraper
     ↓
Real-time Results → Pagination & Display → User Interaction
     ↓
Product Details → Deep Scrape → Modal Display
     ↓
History Event → Event Dispatch → UI Update → API Sync
```

---

## 📁 Project Structure

```
BookExplorer/
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── globals.css         # Global Tailwind styles
│   │   └── page.tsx            # Main page component
│   │
│   ├── components/
│   │   ├── theme-provider.tsx  # Dark/light mode provider
│   │   ├── product-modal.tsx   # Book details modal
│   │   ├── history-section.tsx # Recent views component
│   │   ├── cart-drawer.tsx     # Shopping cart interface
│   │   └── ui/                 # 50+ shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       └── ...             # 45+ more components
│   │
│   ├── hooks/
│   │   ├── use-toast.ts        # Toast notifications
│   │   └── use-mobile.ts       # Mobile detection
│   │
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn)
│   │
│   ├── context/
│   │   └── store-provider.tsx  # Global state & history logic
│   │
│   ├── public/                 # Static assets
│   │   ├── icon.svg
│   │   ├── icon-light-32x32.png
│   │   ├── icon-dark-32x32.png
│   │   ├── apple-icon.png
│   │   └── placeholder-*.{jpg,svg,png}
│   │
│   └── package.json            # Dependencies & scripts
│
├── backend/
│   ├── scraper/                # Web scraping modules
│   │   ├── engine.js           # Selenium/BeautifulSoup wrapper
│   │   ├── parsers.js          # Data extraction logic
│   │   └── cache.js            # Caching layer
│   │
│   ├── api/                    # API endpoints
│   │   ├── search.js           # Book search endpoint
│   │   ├── category.js         # Category browsing
│   │   ├── history.js          # User history tracking
│   │   └── product.js          # Deep product scrape
│   │
│   ├── db/                     # Database layer
│   │   ├── migrations/         # Schema updates
│   │   └── seeds/              # Sample data
│   │
│   ├── middleware/             # Request processing
│   │   ├── auth.js             # Authentication
│   │   ├── validation.js       # Input validation
│   │   └── cors.js             # CORS setup
│   │
│   ├── utils/                  # Helper functions
│   │   ├── logger.js           # Logging
│   │   ├── error-handler.js    # Error management
│   │   └── validators.js       # Schema validation
│   │
│   ├── main.js                 # Application entry point
│   ├── .env.example            # Environment template
│   └── package.json            # Backend dependencies
│
└── README.md                   # This file
```

---

## 📡 API Endpoints

### Search Endpoint

**Request:**
```bash
GET /api/search?query=harry+potter&limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "title": "Harry Potter and the Sorcerer's Stone",
      "author": "J.K. Rowling",
      "publisher": "Bloomsbury",
      "price": 15.99,
      "rating": 4.8,
      "cover_url": "https://...",
      "isbn": "978-0439708180"
    }
  ],
  "pagination": {
    "total": 150,
    "offset": 0,
    "limit": 20
  }
}
```

### Category Endpoint

**Request:**
```bash
GET /api/category?type=fiction&genre=fantasy&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "123", "title": "...", "author": "...", "price": 15.99 }
  ]
}
```

### Product Details Endpoint

**Request:**
```bash
GET /api/product/123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Harry Potter...",
    "description": "Full plot summary...",
    "specs": {
      "isbn": "978-0439708180",
      "pages": 309,
      "binding": "Hardcover",
      "publisher": "Bloomsbury",
      "published_date": "1998-06-26"
    },
    "pricing": [
      {
        "retailer": "Amazon",
        "price": 15.99,
        "availability": "In Stock"
      }
    ],
    "reviews": [
      {
        "author": "John Doe",
        "rating": 5,
        "text": "Amazing book!",
        "date": "2024-01-15"
      }
    ]
  }
}
```

### History Endpoint

**Request:**
```bash
POST /api/history
Content-Type: application/json

{
  "user_id": "user-123",
  "product_id": "product-456"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "456", "title": "...", "viewed_at": "2024-01-13T10:30:00Z" },
    { "id": "789", "title": "...", "viewed_at": "2024-01-13T09:15:00Z" }
  ]
}
```

---

## 🎨 Frontend Components

### ProductModal

Displays comprehensive book information in a modal dialog:

- **Header**: Title, author, and overall rating
- **Content**: Full description and technical specifications
- **Pricing Section**: Real-time prices from multiple retailers
- **Reviews Tab**: User feedback and ratings
- **Actions**: Add to cart, wishlist, and share buttons

### HistorySection

Shows user's recently viewed books:

- **Event Listener**: Real-time updates via `historyUpdated` event
- **Persistent Storage**: Data stored in localStorage
- **Quick Access**: One-click navigation to previously viewed items
- **Auto-refresh**: Syncs with backend history via POST request

### CartDrawer

Shopping cart interface:

- **Item Management**: Add/remove books with quantity controls
- **Price Calculation**: Real-time total aggregation
- **Checkout Flow**: Integration with payment processor
- **Saved Items**: Persist cart state across sessions

### SearchBar

Main search component:

- **Real-time Input**: Debounced search queries
- **Autocomplete**: Suggested titles and authors
- **Filter Support**: Category, price range, ratings
- **Mobile Responsive**: Touch-friendly on all devices

---

## 🔄 Data Persistence & Caching

### Backend Caching

- **Scraper Cache**: 15-minute TTL for product details
- **Search Results**: 5-minute cache with Redis
- **Category Data**: 1-hour static cache

### Frontend Caching

- **localStorage**: History and user preferences
- **SessionStorage**: Current search session data
- **Browser Cache**: Static assets (images, styles)

### Database Optimization

- **Indexed Columns**: `title`, `isbn`, `author` for fast lookups
- **Query Optimization**: Prepared statements to prevent SQL injection
- **Connection Pooling**: PostgreSQL connection management

---

## 🛡️ Security Considerations

### Input Validation

- All search queries sanitized to prevent SQL injection
- Product IDs validated against whitelist
- Request body validated with Zod schemas

### CORS Configuration

```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['GET', 'POST'],
  credentials: true,
  maxAge: 86400
};
```

### Environment Variables

- All sensitive data in `.env` files (never committed)
- Backend API keys rotated monthly
- Database credentials encrypted in production

### Rate Limiting

- Search endpoint: 100 requests per minute per IP
- API endpoints: 30 requests per minute
- Scraper throttled to prevent overwhelming target sites

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel deploy

# Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Backend Deployment (Heroku/Railway/Render)

```bash
# Set environment variables
heroku config:set DATABASE_URL=postgresql://...
heroku config:set PORT=3001

# Deploy
git push heroku main
```

### Database Setup

```bash
# Create PostgreSQL database
createdb wob_explorer

# Run migrations
npm run migrate

# Seed with sample data
npm run seed
```

---

## 📊 Performance Optimizations

### Frontend

- **Code Splitting**: Lazy-loaded components for faster initial load
- **Image Optimization**: Next.js Image component with WebP support
- **CSS Minification**: Tailwind CSS purges unused styles in production
- **Bundle Analysis**: Monitor bundle size with `next/bundle-analyzer`

### Backend

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Reuse database connections
- **Response Compression**: Gzip enabled for all endpoints
- **Scraper Optimization**: Parallel requests with configurable concurrency

### Caching Strategy

```
Request → Check Cache (5-15 min TTL) → Hit? Return → Miss? Scrape → Cache → Return
```

---

## 🐛 Troubleshooting

### Backend Connection Issues

**Problem**: "Cannot connect to database"

```bash
# Check PostgreSQL is running
psql -d wob_explorer

# Verify DATABASE_URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Solution**: Ensure PostgreSQL service is running and credentials are correct.

### Frontend Not Loading Data

**Problem**: "API endpoint not responding"

```javascript
// Check NEXT_PUBLIC_API_BASE_URL in browser console
console.log(process.env.NEXT_PUBLIC_API_BASE_URL)

// Check network tab for failed requests
// Verify CORS headers in response
```

**Solution**: Confirm API base URL is set correctly and backend is running on port 3001.

### Scraper Not Working

**Problem**: "No results from scraper"

```bash
# Check scraper logs
tail -f backend/logs/scraper.log

# Verify target website is accessible
curl https://target-site.com

# Check if selectors have changed
npm run test:scraper
```

**Solution**: Update CSS selectors if target website layout has changed.

### Slow Search Results

**Problem**: "Search takes >5 seconds"

```sql
-- Check indexes on search columns
SELECT * FROM pg_stat_user_indexes;

-- Add missing index
CREATE INDEX idx_books_title ON books USING GIN(title);

-- Check cache hit rate
SELECT * FROM cache_stats;
```

**Solution**: Add database indexes for frequently queried columns.

---

## 📦 Dependencies

### Frontend Dependencies

```json
{
  "next": "16.0.10",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "react-hook-form": "^7.60.0",
  "zod": "3.25.76",
  "tailwindcss": "^4.1.9",
  "lucide-react": "^0.454.0",
  "recharts": "2.15.4",
  "sonner": "^1.7.4",
  "date-fns": "4.1.0"
}
```

### Backend Dependencies

```json
{
  "express": "^4.18.0",
  "pg": "^8.11.0",
  "axios": "^1.6.0",
  "cheerio": "^1.0.0",
  "zod": "^3.22.0"
}
```

---

## 🔮 Future Enhancements

- [ ] Machine learning-based book recommendations
- [ ] Advanced filtering (price range, publication year, language)
- [ ] User authentication and wishlists
- [ ] Multi-language support (i18n)
- [ ] Mobile app version (React Native)
- [ ] Real-time price change notifications via WebSocket
- [ ] Integration with major retailers (API partnerships)
- [ ] Reading lists and social sharing
- [ ] Audio book support
- [ ] Book club features

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive

---

## 📋 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Piyush Framewalla**
- Information Technology Graduate
- Full-stack Developer
- [GitHub](https://github.com)
- [LinkedIn](https://linkedin.com)

---


## 📈 Project Status

- **Current Version**: 1.0.0
- **Last Updated**: January 2025
- **Status**: Active Development

---


**Happy exploring! If you find BookExplorer useful, please consider giving us a ⭐ on GitHub.**
