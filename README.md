# 📚 BookExplorer | Full-Stack Live Scraper & Discovery Engine

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-Latest-f75e95?style=for-the-badge)](https://lucide.dev/)

**BookExplorer** is a high-performance web application designed for real-time book discovery. Unlike static sites, it leverages a live web scraping engine to provide up-to-the-minute pricing, availability, and deep technical specifications directly from global book databases.

---

## ✨ Key Features

* **⚡ Live Scraper Integration:** Real-time data fetching from WorldOfBooks.
* **🔍 Deep Search Engine:** Extracts summaries, reviews, and specs on demand.
* **🌍 Multi-Currency Support:** Real-time conversion across 10+ global currencies (GBP, INR, USD, etc.).
* **🕒 Smart History Tracking:** Automatically persists "Recently Viewed" items using localized event synchronization.
* **🛒 Advanced Cart System:** Smooth, animated sliding drawer with persistent local storage.

---

## 🛠️ Environment Variables

To run this project, you will need to set up the following environment variables in your `.env` files.

### 💻 Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
