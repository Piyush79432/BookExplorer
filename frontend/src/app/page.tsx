"use client"

import { useEffect, useState, createContext, useContext, ReactNode } from "react"
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Heart,
  Skull,
  Ghost,
  Compass,
  Hourglass,
  Archive,
  ChevronDown,
  ShoppingBag,
  Film,
  Music,
  Gamepad2,
  Gift,
  BookMarked,
  Menu,
  X,
  Zap,
  Plus,
  Minus,
  Search,
  User,
  Globe,
  Star,
  Check,
  Trash2,Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

// ==========================================
// 1. CONFIGURATION & TYPES
// ==========================================

const API_BASE_URL = "https://server1-1-uo5x.onrender.com"

// --- Currency Config (Base: GBP) ---
const CURRENCIES = [
  { code: "GBP", symbol: "£", rate: 1.0, name: "British Pound" },
  { code: "INR", symbol: "₹", rate: 105.50, name: "Indian Rupee" },
  { code: "USD", symbol: "$", rate: 1.27, name: "US Dollar" },
  { code: "EUR", symbol: "€", rate: 1.17, name: "Euro" },
  { code: "JPY", symbol: "¥", rate: 188.45, name: "Japanese Yen" },
  { code: "KWD", symbol: "KD", rate: 0.39, name: "Kuwaiti Dinar" },
  { code: "CNY", symbol: "¥", rate: 9.15, name: "Chinese Yuan" },
  { code: "AED", symbol: "dh", rate: 4.66, name: "UAE Dirham" },
  { code: "AUD", symbol: "A$", rate: 1.92, name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", rate: 1.71, name: "Canadian Dollar" },
]

interface Category {
  id: number
  title: string
  url: string
  children?: Category[]
}

interface Product {
  id?: number
  title: string
  author?: string
  price: string
  image: string
  promo?: string
}

interface BestsellerSection {
  title: string
  slug: string
  products: Product[]
}

interface CartItem {
  id: string 
  title: string
  basePrice: number
  image: string
  qty: number
}

// ==========================================
// 2. STORE CONTEXT (The Logic Layer)
// ==========================================

interface StoreContextType {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, delta: number) => void
  clearCart: () => void
  currency: typeof CURRENCIES[0]
  setCurrencyCode: (code: string) => void
  convertPrice: (priceStr: string | number) => string
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  addToHistory: (productId: number) => void
  getHistory: () => number[]
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // --- Persistence Logic ---
  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem("dataexplorer_cart")
    const savedCurrency = localStorage.getItem("dataexplorer_currency")
    
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)) } catch(e) { console.error("Cart load error", e) }
    }
    if (savedCurrency) {
      const found = CURRENCIES.find(c => c.code === savedCurrency)
      if (found) setCurrency(found)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("dataexplorer_cart", JSON.stringify(cart))
      localStorage.setItem("dataexplorer_currency", currency.code)
    }
  }, [cart, currency, mounted])

  // --- Cart Actions ---
  const addToCart = (product: Product) => {
    const rawPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, ""))
    const price = isNaN(rawPrice) ? 0 : rawPrice
    const id = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    setCart(prev => {
      const existing = prev.find(item => item.id === id)
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { 
        id, 
        title: product.title, 
        basePrice: price, 
        image: product.image, 
        qty: 1 
      }]
    })
    setCartOpen(true)
  }

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : item
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => setCart([])

  const setCurrencyCode = (code: string) => {
    const found = CURRENCIES.find(c => c.code === code)
    if (found) setCurrency(found)
  }

  // --- History Management ---
  const addToHistory = (productId: number) => {
  if (!mounted || !productId) return;
  try {
    const existing = localStorage.getItem("dataexplorer_history");
    let history: number[] = existing ? JSON.parse(existing) : [];
    
    // Remove if exists and put at start
    history = history.filter(id => String(id) !== String(productId));
    history.unshift(productId);
    history = history.slice(0, 10);
    
    localStorage.setItem("dataexplorer_history", JSON.stringify(history));
    window.dispatchEvent(new Event("historyUpdated"));
  } catch (e) {
    console.error("History Save Error", e);
  }
};

  const getHistory = (): number[] => {
    if (!mounted) return []
    
    try {
      const existing = localStorage.getItem("dataexplorer_history")
      return existing ? JSON.parse(existing) : []
    } catch (e) {
      console.error("History load error", e)
      return []
    }
  }

  // --- Pricing Engine ---
  const convertPrice = (priceInput: string | number): string => {
    let baseVal = 0
    if (typeof priceInput === 'number') {
      baseVal = priceInput
    } else {
      baseVal = parseFloat(priceInput.replace(/[^0-9.-]+/g, ""))
    }
    
    if (isNaN(baseVal)) return "N/A"
    
    const converted = baseVal * currency.rate
    
    if (currency.code === "JPY") return `${currency.symbol}${Math.round(converted).toLocaleString()}`
    
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <StoreContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQty, clearCart, 
      currency, setCurrencyCode, convertPrice, cartOpen, setCartOpen,
      addToHistory, getHistory
    }}>
      {children}
    </StoreContext.Provider>
  )
}

const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error("useStore must be used within StoreProvider")
  return context
}

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

const NAV_MENU = [
  {
    title: "Fiction",
    slug: "fiction-books",
    icon: Sparkles,
    color: "text-purple-600",
    items: [
      { name: "Crime & Mystery", slug: "crime-mystery" },
      { name: "Fantasy", slug: "fantasy" },
      { name: "Romance", slug: "romance" },
      { name: "Thriller", slug: "thriller-suspense" },
      { name: "Sci-Fi", slug: "science-fiction" },
      { name: "Horror", slug: "horror" },
    ]
  },
  {
    title: "Non-Fiction",
    slug: "non-fiction-books",
    icon: Globe,
    color: "text-blue-600",
    items: [
      { name: "Biography", slug: "biography-and-true-story" },
      { name: "Cooking", slug: "lifestyle-cooking-and-leisure" },
      { name: "History", slug: "humanities-books" },
      { name: "Science", slug: "mathematics-and-science" },
      { name: "Business", slug: "economics-and-finance" },
      { name: "Self Help", slug: "health-and-personal-development" },
    ]
  },
  {
    title: "Children's",
    slug: "childrens-books",
    icon: Star,
    color: "text-yellow-500",
    items: [
      { name: "Ages 0-5", slug: "baby-toddler" },
      { name: "Ages 5-8", slug: "ages-5-8" },
      { name: "Ages 9-12", slug: "ages-9-12" },
      { name: "Young Adult", slug: "teenage-young-adult" },
      { name: "Education", slug: "childrens-education" },
    ]
  },
  {
    title: "Rare Books",
    slug: "rare-books",
    icon: Hourglass,
    color: "text-amber-600",
    items: [
      { name: "First Editions", slug: "rare-fiction" },
      { name: "Signed Copies", slug: "rare-biography" },
      { name: "Antiquarian", slug: "rare-antiques" },
      { name: "Collectibles", slug: "rare-literature" },
    ]
  }
]

const getCategoryStyling = (title: string) => {
  const t = title.toLowerCase()
  if (t.includes("fiction") && !t.includes("non")) return { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", gradient: "from-purple-500 to-purple-600", desc: "Dragons, magic, and epic quests." }
  if (t.includes("crime") || t.includes("mystery")) return { icon: Skull, color: "text-indigo-600", bg: "bg-indigo-50", gradient: "from-indigo-500 to-indigo-600", desc: "Unravel clues and solve cases." }
  if (t.includes("romance")) return { icon: Heart, color: "text-rose-600", bg: "bg-rose-50", gradient: "from-rose-500 to-rose-600", desc: "Tales of love and passion." }
  if (t.includes("adventure")) return { icon: Compass, color: "text-orange-600", bg: "bg-orange-50", gradient: "from-orange-500 to-orange-600", desc: "Thrilling journeys across the globe." }
  if (t.includes("thriller")) return { icon: Ghost, color: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-red-600", desc: "Edge-of-your-seat tension." }
  if (t.includes("classic")) return { icon: Hourglass, color: "text-amber-700", bg: "bg-amber-50", gradient: "from-amber-600 to-amber-700", desc: "Timeless literary masterpieces." }
  if (t.includes("music")) return { icon: Music, color: "text-pink-600", bg: "bg-pink-50", gradient: "from-pink-500 to-pink-600", desc: "CDs, Vinyls, and cassettes." }
  if (t.includes("film") || t.includes("dvd")) return { icon: Film, color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-blue-600", desc: "Movies and TV series." }
  if (t.includes("game")) return { icon: Gamepad2, color: "text-violet-600", bg: "bg-violet-50", gradient: "from-violet-500 to-violet-600", desc: "Video games for all consoles." }
  if (t.includes("sale") || t.includes("clearance")) return { icon: Archive, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-emerald-600", desc: "Last-chance items & deals." }
  if (t.includes("gift")) return { icon: Gift, color: "text-teal-600", bg: "bg-teal-50", gradient: "from-teal-500 to-teal-600", desc: "Perfect presents for readers." }
  if (t.includes("children")) return { icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50", gradient: "from-yellow-500 to-yellow-600", desc: "Books for kids of all ages." }

  return { icon: BookMarked, color: "text-emerald-700", bg: "bg-emerald-50", gradient: "from-emerald-600 to-emerald-700", desc: "Browse our extensive catalog." }
}

// --- Cart Drawer ---
const CartDrawer = () => {
  const { cart, removeFromCart, updateQty, convertPrice, cartOpen, setCartOpen } = useStore()
  const subtotalGBP = cart.reduce((acc, item) => acc + (item.basePrice * item.qty), 0)

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col border-l border-slate-200"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Your Cart</h2>
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.qty, 0)}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBag className="w-16 h-16 text-slate-300" />
                  <p className="font-bold text-slate-400">Your bag is empty.</p>
                  <button onClick={() => setCartOpen(false)} className="text-emerald-600 font-bold hover:underline text-sm">
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 group">
                    <div className="relative w-20 h-28 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors text-sm">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-1 bg-white">
                          <button onClick={() => item.qty > 1 ? updateQty(item.id, -1) : removeFromCart(item.id)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600">
                            {item.qty === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          </button>
                          <span className="text-xs font-bold text-slate-700 w-3 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-black text-slate-900">{convertPrice(item.basePrice * item.qty)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-500">Subtotal</span>
                  <span className="font-black text-slate-900 text-lg">{convertPrice(subtotalGBP)}</span>
                </div>
                <button className="w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2">
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// --- Product Row Component ---
const ProductRow = ({ title, slug, products }: { title: string; slug: string; products: Product[] }) => {
  const { addToCart, convertPrice, addToHistory } = useStore()
  const hasPromo = title.toLowerCase().includes("sale")

  const handleProductClick = (product: Product) => {
    if (product.id) {
      addToHistory(product.id)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="py-8 md:py-14 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/30"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between px-4 md:px-6 mb-6 md:mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {hasPromo && (
            <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            {title}
            {hasPromo && (
              <span className="text-sm md:text-base font-semibold text-emerald-600 bg-emerald-50 px-2 md:px-3 py-1 rounded-full">Hot</span>
            )}
          </h2>
        </div>
        <Link href={`/collections/${slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="text-xs md:text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-all group">
          View all <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <motion.div
        className="overflow-x-auto pb-4 px-4 md:px-6 scrollbar-hide"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex gap-3 md:gap-5 w-max mx-auto md:mx-0 max-w-7xl">
          {products.map((prod, idx) => (
            <motion.div
              key={idx}
              className="w-[150px] sm:w-[170px] md:w-[210px] flex-shrink-0 group relative cursor-pointer"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleProductClick(prod)}
            >
              <div className="relative aspect-[2/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden mb-3 shadow-md group-hover:shadow-2xl transition-all duration-500 border border-slate-200/50">
                {prod.image ? (
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, 210px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                    <BookOpen className="w-10 h-10" />
                  </div>
                )}
                {prod.promo && (
                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold py-1.5 px-2 text-center uppercase tracking-wider shadow-lg">
                    {prod.promo}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 px-1">
                <h3 className="font-bold text-slate-900 leading-tight text-xs md:text-sm line-clamp-2 min-h-[2.5rem]">
                  {prod.title}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 truncate font-medium flex items-center gap-1">
                   <BookOpen className="w-3 h-3 opacity-50" />
                   {prod.author || "Unknown Author"}
                </p>
                <div className="flex items-center justify-between pt-1 gap-2">
                  <span className="font-bold text-slate-900 bg-gradient-to-br from-slate-100 to-slate-200 px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm shadow-sm border border-slate-200">
                    {convertPrice(prod.price)}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(prod)
                    }}
                    className="p-2 md:p-2.5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Animated Loader
const BookLoader = () => (
  <div className="flex flex-col items-center justify-center py-24 space-y-6">
    <div className="relative w-16 h-12">
      <motion.div className="absolute inset-0 border-2 border-emerald-600 rounded-r-lg bg-white origin-left" animate={{ rotateY: [0, -180, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute inset-0 border-2 border-emerald-600 rounded-r-lg bg-white origin-left" animate={{ rotateY: [0, -180, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
      <div className="absolute inset-0 border-4 border-slate-800 rounded-r-xl z-10"></div>
    </div>
    <motion.p className="text-sm font-bold text-slate-400 uppercase tracking-widest" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>Scanning Library...</motion.p>
  </div>
)

// History Section
const HistorySection = () => {
  const { convertPrice, addToCart } = useStore();
  const [historyProducts, setHistoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // 1. Get IDs from localStorage
      const saved = localStorage.getItem("dataexplorer_history");
      const historyIds: number[] = saved ? JSON.parse(saved) : [];
      
      if (historyIds.length === 0) {
        setHistoryProducts([]);
        setLoading(false);
        return;
      }

      // 2. Fetch from your backend
      const res = await fetch(`${API_BASE_URL}/history`, {
        method: 'POST',
       headers: {
    'Content-Type': 'application/json', 
        // ✅ Add this for ngrok
        'ngrok-skip-browser-warning': 'true', 
        // Keep this if you still have Localtunnel logic
        'Bypass-Tunnel-Reminder': 'true'},
        body: JSON.stringify({ ids: historyIds })
      });

      if (res.ok) {
        const data = await res.json();
        
        // 3. FIX: Match IDs regardless of Type (String vs Number)
        // This ensures the order matches your "Recently Viewed" sequence
        const orderedData = historyIds
          .map(id => data.find((p: any) => String(p.id) === String(id)))
          .filter(Boolean) as Product[];

        setHistoryProducts(orderedData);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchHistory();

    // Listen for updates if user views a product in a modal on the same page
    const handleUpdate = () => fetchHistory();
    window.addEventListener('historyUpdated', handleUpdate);
    return () => window.removeEventListener('historyUpdated', handleUpdate);
  }, []);

  if (!loading && historyProducts.length === 0) return null;

  return (
    <motion.section 
      className="py-16 border-t border-slate-100 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Recently Viewed
        </h2>
        <p className="text-slate-500 text-sm mt-1">Based on your browsing history</p>
      </div>

      <div className="overflow-x-auto pb-8 px-4 md:px-6 scrollbar-hide">
        <div className="flex gap-6 w-max max-w-7xl mx-auto md:mx-0">
          {loading ? (
            <div className="w-full flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            historyProducts.map((prod) => (
              <motion.div 
                key={prod.id} 
                className="w-[160px] md:w-[200px] group cursor-pointer"
                whileHover={{ y: -5 }}
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-slate-200 mb-3 shadow-sm group-hover:shadow-xl transition-all">
                  <Image src={prod.image || "/placeholder.svg"} alt={prod.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => addToCart(prod)}
                      className="p-3 bg-white text-slate-900 rounded-full hover:bg-emerald-500 hover:text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-xs md:text-sm line-clamp-1">{prod.title}</h3>
                <p className="font-black text-emerald-600 mt-1">{convertPrice(prod.price)}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
};

// ==========================================
// 4. MAIN PAGE CONTENT
// ==========================================

function LandingContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [bestsellers, setBestsellers] = useState<BestsellerSection[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  
  const { cart, setCartOpen, currency, setCurrencyCode } = useStore()
  const [currencyOpen, setCurrencyOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [navRes, bestRes] = await Promise.all([
          fetch(`${API_BASE_URL}/navigation`),
          fetch(`${API_BASE_URL}/bestsellers`)
        ])
        const navData = await navRes.json()
        const bestData = await bestRes.json()
        
        if (Array.isArray(navData)) {
          const newCats = navData.filter((d) => !["Fiction Books", "Non-Fiction Books", "Children's Books", "Rare Books"].includes(d.title))
          setCategories(newCats)
        }
        if (Array.isArray(bestData)) setBestsellers(bestData)
      } catch (error) {
        console.error("Fetch Error", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const navVariants = { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      <CartDrawer />

      {/* --- Navbar --- */}
      <motion.nav
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm supports-[backdrop-filter]:bg-white/70"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 md:p-2.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow"
              whileHover={{ rotate: 10, scale: 1.1 }}
            >
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
            <span className="text-lg md:text-xl font-black tracking-tight text-slate-900">
              Data<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-700">Explorer</span>
            </span>
          </Link>

          <div className="hidden lg:flex gap-1 items-center bg-slate-50/50 p-1.5 rounded-full border border-slate-100">
             <Link href="/" className="px-4 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors">About</Link>
             {NAV_MENU.map((menuItem) => (
                <div key={menuItem.slug} className="relative group" onMouseEnter={() => setHoveredNav(menuItem.slug)} onMouseLeave={() => setHoveredNav(null)}>
                  <Link href={`/collections/${menuItem.slug}`} className="relative px-5 py-2 rounded-full text-sm font-bold text-slate-600 transition-all z-10 block">
                     <span className={`relative z-10 group-hover:text-emerald-700 transition-colors ${hoveredNav === menuItem.slug ? "text-emerald-700" : ""}`}>{menuItem.title}</span>
                     {hoveredNav === menuItem.slug && (
                       <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                     )}
                  </Link>
                  <motion.div 
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 w-[260px]"
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                  >
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                       <div className={`px-4 py-3 bg-slate-50 rounded-xl mb-2 flex items-center gap-2 ${menuItem.color} bg-opacity-10`}>
                          <menuItem.icon className={`w-4 h-4 ${menuItem.color}`} />
                          <span className={`text-xs font-black uppercase tracking-widest ${menuItem.color}`}>{menuItem.title}</span>
                       </div>
                       <div className="space-y-1">
                          {menuItem.items.map((sub, idx) => (
                             <Link key={idx} href={`/collections/${sub.slug}`} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors group/item">
                                {sub.name}
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                             </Link>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                </div>
             ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            
            <div className="relative">
              <button onClick={() => setCurrencyOpen(!currencyOpen)} className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-slate-100 text-slate-600 font-bold text-sm transition-colors border border-transparent hover:border-slate-200">
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black">{currency.symbol}</span>
                <span className="hidden sm:inline">{currency.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {currencyOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden py-2 z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">Select Currency</div>
                    {CURRENCIES.map((cur) => (
                      <button 
                        key={cur.code}
                        onClick={() => { setCurrencyCode(cur.code); setCurrencyOpen(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between text-sm group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                           <span className="font-mono text-slate-400 w-6">{cur.symbol}</span>
                           <span className={`font-bold ${currency.code === cur.code ? 'text-emerald-600' : 'text-slate-700'}`}>{cur.name}</span>
                        </div>
                        {currency.code === cur.code && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

             <div className="relative">
                <motion.button 
                  onClick={() => setCartOpen(true)}
                  className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-300 hover:shadow-emerald-200"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                >
                   <ShoppingBag className="w-5 h-5" />
                </motion.button>
                {cart.length > 0 && (
                   <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                     {cart.reduce((a,b) => a + b.qty, 0)}
                   </span>
                )}
             </div>

             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg ml-1">
               <Menu className="w-6 h-6 text-slate-600" />
             </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-white border-t border-slate-200 overflow-hidden"
        >
          <div className="px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
             {NAV_MENU.map((cat, i) => (
                <div key={i} className="space-y-2">
                   <Link href={`/collections/${cat.slug}`} className="flex items-center gap-2 font-bold text-slate-900">
                      <cat.icon className={`w-4 h-4 ${cat.color}`} />
                      {cat.title}
                   </Link>
                   <div className="pl-6 space-y-2 border-l-2 border-slate-100 ml-2">
                      {cat.items.map((sub, j) => (
                         <Link key={j} href={`/collections/${sub.slug}`} className="block text-sm text-slate-600 hover:text-emerald-600">
                           {sub.name}
                         </Link>
                      ))}
                   </div>
                </div>
             ))}
          </div>
        </motion.div>
      </motion.nav>

      <motion.header 
        className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden py-16 md:py-24 text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
      >
        <div className="relative z-10 max-w-4xl mx-auto px-4">
           <motion.div 
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md"
             initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
           >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live System Online
           </motion.div>
           <motion.h1 
             className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 leading-tight"
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
           >
             Curated Books. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Live Data.</span>
           </motion.h1>
           <motion.p 
             className="text-slate-300 text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
           >
             Experience a production-grade scraper in action. Real-time bestsellers, granular categorization, and live pricing from the source.
           </motion.p>
           <motion.div 
             className="flex items-center justify-center gap-4"
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
           >
              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth'})} className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/20">
                 Start Exploring
              </button>
              <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                 View GitHub
              </button>
           </motion.div>
        </div>

        <motion.div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" animate={{ x: [0, 30, 0], y: [0, -30, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      </motion.header>

      <section className="bg-white min-h-[400px]">
        {loading ? (
          <BookLoader />
        ) : bestsellers.length > 0 ? (
          bestsellers.map((section, idx) => (
            <ProductRow key={idx} title={section.title} slug={section.slug} products={section.products} />
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 font-bold">Waiting for live data...</div>
        )}
      </section>

      <motion.section 
        className="py-12 md:py-24 max-w-7xl mx-auto px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">Explore our vast collection of genres and discover your next favorite read.</p>
          </div>
          <Link href="/" className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl">
              Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 8).map((cat, idx) => {
            const slug = cat.url ? cat.url.split("/").pop() : "unknown"
            const { icon: Icon, color, bg, gradient, desc } = getCategoryStyling(cat.title)
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}>
                <Link href={`/collections/${slug}`} className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 hover:shadow-2xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <motion.div className={`${bg} w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg`} whileHover={{ scale: 1.15, rotate: 6 }}>
                        <Icon className={`w-7 h-7 md:w-8 md:h-8 ${color}`} />
                      </motion.div>
                      <ArrowRight className={`w-6 h-6 ${color} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`} />
                    </div>
                    <div className="mt-auto">
                      <h3 className="text-base md:text-lg font-black text-slate-800 group-hover:text-emerald-700 transition-colors mb-2 leading-tight">{cat.title}</h3>
                      <p className="text-xs md:text-sm text-slate-500 line-clamp-2 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.section>
      
      <HistorySection />

      <footer className="border-t border-slate-200 py-12 bg-slate-50 text-center">
        <p className="text-slate-500 text-sm">© 2026 DataExplorer. Built for book lovers.</p>
      </footer>
    </div>
  )
}

export default function LandingPage() {
  return (
    <StoreProvider>
      <LandingContent />
    </StoreProvider>
  )
}
