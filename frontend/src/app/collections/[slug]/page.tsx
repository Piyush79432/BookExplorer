'use client';

import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { 
  ArrowLeft, Filter, ShoppingBag, 
  Heart, BookOpen, Search, X, Star, Zap, Loader2, ChevronRight, 
  Globe, Music, Trash2, Plus, Minus, Check, ChevronDown, TicketPercent,
  Timer, Hourglass, Share2, Truck, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. CONFIGURATION & TYPES
// ==========================================
const API_BASE_URL = 'https://tired-eyes-bathe.loca.lt'; 

const CURRENCIES = [
  { code: "GBP", symbol: "£", rate: 1.0, name: "British Pound" },
  { code: "INR", symbol: "₹", rate: 105.50, name: "Indian Rupee" },
  { code: "USD", symbol: "$", rate: 1.27, name: "US Dollar" },
  { code: "EUR", symbol: "€", rate: 1.17, name: "Euro" },
  { code: "JPY", symbol: "¥", rate: 188.45, name: "Japanese Yen" },
]

interface Product {
  id: number;
  title: string;
  author?: string;
  price: string;
  image: string;
  promo?: string;
  summary?: string;
  condition?: string;
  specifications?: Record<string, string>;
  reviews?: { text: string }[];
  recommendations?: { title: string, price: string, image: string }[];
}

interface CartItem {
  id: string 
  title: string
  basePrice: number
  image: string
  qty: number
}

// ==========================================
// 2. STORE CONTEXT (Enhanced with History Logic)
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
  addToHistory: (productId: number) => void // New logic
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem("dataexplorer_cart")
    const savedCurrency = localStorage.getItem("dataexplorer_currency")
    if (savedCart) try { setCart(JSON.parse(savedCart)) } catch(e) {}
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

  // --- History Logic ---
  const addToHistory = (productId: number) => {
    if (!mounted || !productId) return;
    try {
      const existing = localStorage.getItem("dataexplorer_history");
      let history: number[] = existing ? JSON.parse(existing) : [];
      
      // Remove duplicates and move to top
      history = history.filter(id => String(id) !== String(productId));
      history.unshift(productId);
      history = history.slice(0, 10); // Keep last 10
      
      localStorage.setItem("dataexplorer_history", JSON.stringify(history));
      // Trigger event for Landing Page HistorySection to refresh
      window.dispatchEvent(new Event("historyUpdated"));
    } catch (e) {
      console.error("History Error", e);
    }
  };

  const addToCart = (product: Product) => {
    const rawPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, ""))
    const price = isNaN(rawPrice) ? 0 : rawPrice
    const id = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    setCart(prev => {
      const existing = prev.find(item => item.id === id)
      if (existing) return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item)
      return [...prev, { id, title: product.title, basePrice: price, image: product.image, qty: 1 }]
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

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id))
  const clearCart = () => setCart([])
  const setCurrencyCode = (code: string) => { const found = CURRENCIES.find(c => c.code === code); if (found) setCurrency(found); }

  const convertPrice = (priceInput: string | number): string => {
    let baseVal = typeof priceInput === 'number' ? priceInput : parseFloat(priceInput.replace(/[^0-9.-]+/g, ""))
    if (isNaN(baseVal)) return "N/A"
    const converted = baseVal * currency.rate
    if (currency.code === "JPY") return `${currency.symbol}${Math.round(converted).toLocaleString()}`
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <StoreContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, currency, setCurrencyCode, convertPrice, cartOpen, setCartOpen, addToHistory }}>
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
// 3. CART DRAWER
// ==========================================
const CartDrawer = () => {
  const { cart, removeFromCart, updateQty, convertPrice, cartOpen, setCartOpen } = useStore()
  const subtotalGBP = cart.reduce((acc, item) => acc + (item.basePrice * item.qty), 0)

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col border-l border-slate-200"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShoppingBag className="w-5 h-5" /></div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Your Cart</h2>
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cart.reduce((a,b)=>a+b.qty,0)}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBag className="w-16 h-16 text-slate-300" />
                  <p className="font-bold text-slate-400">Your bag is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div key={item.id} layout className="flex gap-4">
                    <div className="relative w-20 h-28 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <h4 className="font-bold text-slate-800 line-clamp-2 text-sm">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-1 bg-white">
                          <button onClick={() => item.qty > 1 ? updateQty(item.id, -1) : removeFromCart(item.id)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600">
                             {item.qty === 1 ? <Trash2 className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          </button>
                          <span className="text-xs font-bold text-slate-700 w-3 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-600"><Plus className="w-3 h-3" /></button>
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
                <button className="w-full py-4 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-xl">Checkout</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ==========================================
// 4. CATEGORY DEFINITIONS
// ==========================================

const FICTION_MAIN_GROUP = {
  id: 'fiction-main',
  title: "Fiction",
  icon: <BookOpen className="w-4 h-4" />,
  items: [
    { name: "All Fiction Books", slug: "fiction-books" },
    { name: "Crime & Mystery", slug: "crime-mystery" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Modern Fiction", slug: "modern-fiction" },
    { name: "Romance", slug: "romance" },
    { name: "Adventure", slug: "adventure" },
    { name: "Thriller & Suspense", slug: "thriller-suspense" },
    { name: "Classic Fiction", slug: "classic-fiction" },
    { name: "Erotic Fiction", slug: "erotic-fiction" },
    { name: "Anthologies & Short Stories", slug: "anthologies-short-stories" },
    { name: "Graphic Novels", slug: "graphic-novels" },
    { name: "Historical Fiction", slug: "historical-fiction" },
    { name: "Horror & Ghost Stories", slug: "horror" },
    { name: "Religious & Spiritual Fiction", slug: "religious-spiritual-fiction" },
    { name: "Science Fiction", slug: "science-fiction" },
    { name: "Fiction Related Items", slug: "fiction-related-items-books" },
    { name: "Sagas", slug: "sagas-books" }
  ]
};

const NON_FICTION_MAIN_GROUP = {
  id: 'non-fiction-main',
  title: "Non-Fiction",
  icon: <Globe className="w-4 h-4" />,
  items: [
    { name: "All Non-Fiction", slug: "non-fiction-books" },
    { name: "Biography & True Stories", slug: "biography-and-true-story" },
    { name: "Health & Personal Development", slug: "health-and-personal-development" },
    { name: "Lifestyle, Cooking & Leisure", slug: "lifestyle-cooking-and-leisure" },
    { name: "History", slug: "history-books" },
    { name: "Science & Mathematics", slug: "mathematics-and-science" },
    { name: "Rare Non-Fiction", slug: "rare-non-fiction-books" },
    { name: "Humanities", slug: "rare-humanities-books" },
    { name: "Art, Fashion & Photography", slug: "rare-art-fashion-photography-books" },
  ]
};

const CHILDREN_MAIN_GROUP = {
  id: 'children-main',
  title: "Children",
  icon: <Star className="w-4 h-4" />,
  items: [
    { name: "All Children's Books", slug: "childrens-books" },
    { name: "Children’s Fiction", slug: "childrens-fiction" },
    { name: "Baby & Toddler", slug: "baby-toddler" },
    { name: "Ages 5–8", slug: "ages-5-8" },
    { name: "Teenage & Young Adult", slug: "teenage-young-adult" },
  ]
};

const RARE_MAIN_GROUP = {
  id: 'rare-main',
  title: "Rare & Collectible",
  icon: <Hourglass className="w-4 h-4" />,
  items: [
    { name: "All Rare Fiction", slug: "rare-fiction-books" },
    { name: "Rare Crime", slug: "rare-crime-books" },
    { name: "Rare Thriller", slug: "rare-thriller-books" },
  ]
};

// ==========================================
// 5. PRODUCT DETAILS POPUP MODAL (Enhanced History)
// ==========================================

const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const { addToCart, convertPrice, addToHistory } = useStore();
  const [details, setDetails] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');

  useEffect(() => {
    // --- SAVE TO HISTORY IMMEDIATELY ---
    if (product.id) {
      addToHistory(product.id);
    }

    const fetchDeepDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(product.title)}`);
        if (res.ok) {
            const data = await res.json();
            setDetails({
                ...product,
                ...data,
                specifications: data.specifications || {},
                reviews: data.reviews || [],
                recommendations: data.recommendations || []
            });
        } else {
            setDetails(product);
        }
      } catch (e) {
        console.error("Scraping failed", e);
        setDetails(product);
      } finally {
        setLoading(false);
      }
    };

    fetchDeepDetails();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [product, addToHistory]);

  const displayed = details || product;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/50 hover:bg-slate-100 backdrop-blur rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-800" />
        </button>

        <div className="w-full md:w-1/3 bg-slate-50 relative flex flex-col border-r border-slate-100">
             <div className="flex-1 relative flex items-center justify-center p-8">
                {displayed.image ? (
                    <div className="relative w-48 md:w-64 aspect-[2/3] shadow-2xl rounded-lg overflow-hidden">
                         <Image src={displayed.image} alt={displayed.title} fill className="object-cover" />
                    </div>
                ) : (
                    <BookOpen className="w-32 h-32 text-slate-300" />
                )}
             </div>
             
             <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                        <Check className="w-3 h-3" /> In Stock
                    </span>
                    <span className="flex items-center gap-2 text-slate-500 font-medium">
                        <Truck className="w-3 h-3" /> Free Delivery
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-900 font-bold">Condition: {displayed.condition || "New"}</span>
                </div>
             </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col bg-white">
            <div className="p-8 pb-4 border-b border-slate-100">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        {displayed.author && <p className="text-emerald-600 font-bold text-xs uppercase tracking-widest mb-2">{displayed.author}</p>}
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3 line-clamp-2">{displayed.title}</h2>
                        <div className="flex items-center gap-2">
                             <div className="flex text-amber-400 gap-0.5"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                             <span className="text-xs font-bold text-slate-400 ml-1">({displayed.reviews?.length || 12} Reviews)</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-slate-900">{convertPrice(displayed.price)}</div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inc. VAT</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 space-y-6">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                        <p className="text-xs text-slate-400 mt-1">Fetching deep details...</p>
                    </div>
                ) : (
                    <div className="p-8 pt-2">
                        <div className="flex items-center gap-8 border-b border-slate-100 mb-6 sticky top-0 bg-white z-10 pt-4">
                            {['overview', 'specs', 'reviews'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)} 
                                    className={`pb-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-[200px]">
                            {activeTab === 'overview' && (
                                <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed">
                                    <p className="whitespace-pre-line">
                                        {displayed.summary && displayed.summary.length > 20 ? displayed.summary : "No summary available."}
                                    </p>
                                </div>
                            )}

                            {activeTab === 'specs' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {displayed.specifications && Object.entries(displayed.specifications).map(([key, val]) => (
                                        <div key={key} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                                            <span className="font-bold text-slate-500 text-xs uppercase">{key}</span>
                                            <span className="font-medium text-slate-900 text-sm text-right">{String(val)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="space-y-4">
                                    {displayed.reviews?.map((rev, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <p className="text-sm text-slate-700 italic font-medium">"{rev.text}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {displayed.recommendations && displayed.recommendations.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-slate-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">You Might Also Like</h4>
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {displayed.recommendations.map((rec: any, i: number) => (
                                        <div key={i} className="flex-shrink-0 w-32">
                                            <div className="relative aspect-[2/3] bg-slate-100 rounded-xl overflow-hidden mb-2 border border-slate-200">
                                                {rec.image && <Image src={rec.image} alt={rec.title} fill className="object-cover" />}
                                            </div>
                                            <h5 className="text-[10px] font-bold text-slate-800 line-clamp-2 leading-tight">{rec.title}</h5>
                                            <p className="text-xs font-black text-emerald-600">{convertPrice(rec.price)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
                <div className="flex gap-4">
                    <button className="p-4 rounded-2xl border border-slate-200 hover:bg-slate-50">
                        <Heart className="w-6 h-6 text-slate-400" />
                    </button>
                    <button 
                        onClick={() => { addToCart(displayed); onClose(); }}
                        className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                    >
                        <ShoppingBag className="w-5 h-5" /> Add to Cart
                    </button>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  )
}

// ==========================================
// 6. HELPER COMPONENTS
// ==========================================

const SalesBanner = () => (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 shadow-2xl">
       <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-2">
                <TicketPercent className="w-3 h-3" /> Limited Time
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Flash Sale: 50% Off</h3>
              <p className="text-slate-400 text-sm font-medium">Grab your favorites before they are gone.</p>
          </div>
          <div className="flex flex-col items-center gap-1">
              <div className="text-4xl font-black text-white flex items-center gap-2">
                <Timer className="w-8 h-8 text-emerald-500" /> 02:14:59
              </div>
          </div>
          <button className="px-8 py-4 bg-white text-slate-900 font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all">Shop Now</button>
       </div>
       <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
    </div>
);
  
const SidebarGroup = ({ group, currentSlug, closeMobile }: { group: any, currentSlug: string, closeMobile?: () => void }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="text-slate-400">{group.icon}</span>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{group.title}</h3>
      </div>
      <div className="flex flex-col space-y-1">
        {group.items.map((item: any) => {
          const isActive = currentSlug === item.slug;
          return (
            <Link key={item.slug} href={`/collections/${item.slug}`} onClick={closeMobile} className={`flex items-center justify-between text-[13px] font-bold py-1.5 transition-all group ${isActive ? 'text-emerald-600 pl-2 border-l-2 border-emerald-500' : 'text-slate-600 hover:text-emerald-600 hover:pl-1'}`}>
              <span className="truncate pr-2">{item.name}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </div>
    </div>
);
  
const FilterSection = ({ title, items }: { title: string, items: string[] }) => (
    <div className="space-y-5">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-emerald-600" />
            <span className="text-[13px] font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{item}</span>
          </label>
        ))}
      </div>
    </div>
);
  
const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => {
    const { addToCart, convertPrice } = useStore();
    return (
      <div className="group space-y-5 cursor-pointer" onClick={onClick}>
        <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-200/50 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500 ease-out">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400"><BookOpen className="w-10 h-10" /></div>
          )}
          {product.promo && (
            <div className="absolute bottom-4 left-4 right-4 bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black py-2 rounded-xl text-center uppercase tracking-widest shadow-lg">{product.promo}</div>
          )}
          <button className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:text-rose-500">
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
  
        <div className="px-2 space-y-2">
          <h4 className="text-sm font-black text-slate-900 line-clamp-2 leading-tight h-10 group-hover:text-emerald-600 transition-colors">{product.title}</h4>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-black text-slate-900">{convertPrice(product.price)}</span>
            <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl">
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
};

// ==========================================
// 7. MAIN CONTENT COMPONENT
// ==========================================

function CollectionContent({ slug }: { slug: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isCrawlingMore, setIsCrawlingMore] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
    const { cart, setCartOpen, currency, setCurrencyCode } = useStore();
  
    let activeGroups: any[] = [];
    const isInGroup = (group: any) => group.items.some((i: any) => i.slug === slug);
  
    if (isInGroup(FICTION_MAIN_GROUP) || (slug.includes('fiction') && !slug.includes('non'))) {
       activeGroups = [FICTION_MAIN_GROUP];
    } else if (isInGroup(NON_FICTION_MAIN_GROUP) || slug.includes('non-fiction')) {
       activeGroups = [NON_FICTION_MAIN_GROUP];
    } else if (isInGroup(CHILDREN_MAIN_GROUP) || slug.includes('child')) {
       activeGroups = [CHILDREN_MAIN_GROUP];
    } else {
       activeGroups = [FICTION_MAIN_GROUP];
    }
  
    const fetchWithHeaders = async (url: string) => {
      try {
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json', "Bypass-Tunnel-Reminder": "true" } });
        if (!res.ok) throw new Error('Fetch failed');
        return await res.json();
      } catch (err) {
        console.error("Fetch Error:", err);
        throw err;
      }
    };
  
    useEffect(() => {
      async function initFetch() {
        setLoading(true);
        setError(false);
        setProducts([]); 
        try {
          const data = await fetchWithHeaders(`${API_BASE_URL}/category/${slug}`);
          setProducts(data);
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      }
      initFetch();
    }, [slug]);
  
    const handleLoadMore = async () => {
      if (isCrawlingMore) return;
      setIsCrawlingMore(true);
      try {
        const data = await fetchWithHeaders(`${API_BASE_URL}/category/${slug}?loadMore=true`);
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const filtered = data.filter((p: Product) => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
      } catch (err) { console.error(err); } finally { setIsCrawlingMore(false); }
    };
  
    const displayTitle = slug.replace(/-/g, ' ').toUpperCase();
  
    return (
      <div className="min-h-screen bg-white font-sans">
        <CartDrawer />
        
        <AnimatePresence>
          {selectedProduct && (
              <ProductModal 
                  product={selectedProduct} 
                  onClose={() => setSelectedProduct(null)} 
              />
          )}
        </AnimatePresence>
        
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 text-slate-500 hover:text-emerald-600 transition-all font-black uppercase text-[11px] tracking-[0.2em] group">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            
            <div className="hidden lg:flex flex-col items-center flex-1">
              <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900 truncate max-w-[400px]">
                {displayTitle}
              </h1>
            </div>
  
            <div className="flex items-center gap-4">
               <div className="relative w-40 sm:w-60">
                  <input 
                     type="text" 
                     placeholder="Search..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-2xl text-xs font-bold"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
               </div>
  
               <button onClick={() => setCartOpen(true)} className="flex bg-slate-900 text-white p-3 rounded-2xl shadow-xl">
                  <ShoppingBag className="w-5 h-5" />
               </button>
            </div>
          </div>
        </header>
  
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
            <aside className="hidden lg:block w-64 flex-shrink-0 space-y-10">
              {activeGroups.map((group) => (
                 <SidebarGroup key={group.id} group={group} currentSlug={slug} />
              ))}
              <FilterSection title="Price Range" items={["£3.00 - £5.99", "£6.00 - £8.99", "£12.00+"]} />
            </aside>
  
            <div className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-8">
                  <div className="w-24 h-24 border-8 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Scraping Live Data...</p>
                </div>
              ) : error ? (
                 <div className="py-20 text-center">Unable to fetch products. Ensure backend is on port 3001.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-10">
                  {products.length > 0 ? (
                    products.map((prod, idx) => (
                      <React.Fragment key={`${prod.id}-${idx}`}>
                         {idx === 8 && <div className="col-span-full my-8"><SalesBanner /></div>}
                         <ProductCard product={prod} onClick={() => setSelectedProduct(prod)} />
                      </React.Fragment>
                    ))
                  ) : <div className="col-span-full py-20 text-center">No books found in this category.</div>}
                </div>
              )}
  
              {!loading && !error && products.length > 0 && (
                <div className="mt-24 text-center">
                  <button onClick={handleLoadMore} disabled={isCrawlingMore} className={`px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] bg-slate-900 text-white hover:bg-emerald-600 transition-all`}>
                    {isCrawlingMore ? 'Extracting...' : 'Load More Books'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
}

// ==========================================
// 8. DEFAULT EXPORT
// ==========================================
export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params);
    return (
      <StoreProvider>
        <CollectionContent slug={slug} />
      </StoreProvider>
    );
}
