"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, ShoppingCart, Heart, Loader2, Grid3x3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Product {
  id: number
  title: string
  author?: string
  price: string
  image: string
  promo?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const skeletonVariants = {
  animate: {
    background: [
      "linear-gradient(90deg, #f0f4f8 0%, #d9e5f0 50%, #f0f4f8 100%)",
      "linear-gradient(90deg, #d9e5f0 0%, #f0f4f8 50%, #d9e5f0 100%)",
      "linear-gradient(90deg, #f0f4f8 0%, #d9e5f0 50%, #f0f4f8 100%)",
    ],
    backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
  },
}

export default function CollectionContent({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [slug, setSlug] = useState<string>("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isCrawlingMore, setIsCrawlingMore] = useState(false)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  const subCategories = [
    { name: "Trending", slug: "trending-books" },
    { name: "Fantasy", slug: "fantasy" },
    { name: "Mystery", slug: "crime-mystery" },
    { name: "Fiction", slug: "modern-fiction" },
    { name: "Romance", slug: "romance" },
    { name: "Thriller", slug: "thriller-suspense" },
    { name: "Sci-Fi", slug: "science-fiction" },
    { name: "Classics", slug: "classic-fiction" },
  ]

  useEffect(() => {
    params.then((resolvedParams) => {
      setSlug(resolvedParams.slug)
    })
  }, [params])

  useEffect(() => {
    if (!slug) return

    async function initFetch() {
      setLoading(true)
      setProducts([])
      try {
        const res = await fetch(`http://localhost:3001/category/${slug}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error("Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    initFetch()
  }, [slug])

  const handleLoadMore = async () => {
    if (isCrawlingMore) return
    setIsCrawlingMore(true)
    try {
      const res = await fetch(`http://localhost:3001/category/${slug}?loadMore=true`)
      if (!res.ok) throw new Error("Failed to fetch more")
      const newProducts = await res.json()

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const filtered = newProducts.filter((p: Product) => !existingIds.has(p.id))
        return [...prev, ...filtered]
      })
    } catch (err) {
      console.error("Load More Error:", err)
    } finally {
      setIsCrawlingMore(false)
    }
  }

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const displayTitle = slug
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* HEADER */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-all group">
            <motion.div
              className="p-2 rounded-lg hover:bg-emerald-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </motion.div>
            <span className="hidden md:block text-sm font-semibold">Back</span>
          </Link>

          <motion.h1
            className="text-2xl md:text-3xl font-bold text-slate-900 text-center flex-1 mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {displayTitle}
          </motion.h1>

          <div className="flex gap-3">
            <motion.button
              className="p-2.5 bg-slate-100 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* CATEGORY SCROLL */}
        <motion.div
          className="border-t border-slate-100 bg-white/50 backdrop-blur-sm overflow-x-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-2 py-3 min-w-max md:min-w-full overflow-x-auto scrollbar-hide">
            <motion.div className="flex gap-2" variants={containerVariants} initial="hidden" animate="visible">
              {subCategories.map((cat) => {
                const isActive = slug === cat.slug
                return (
                  <motion.div key={cat.slug} variants={cardVariants}>
                    <Link
                      href={`/collections/${cat.slug}`}
                      className={`
                        whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all
                        ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }
                      `}
                    >
                      {cat.name}
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </motion.div>
      </motion.header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <motion.div
          className="flex justify-between items-center mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 text-slate-600">
            <Grid3x3 className="w-4 h-4" />
            <span className="text-sm font-semibold">{products.length} Books Found</span>
          </div>
        </motion.div>

        {loading ? (
          // LOADING SKELETON
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div key={i} className="space-y-4" variants={cardVariants}>
                <motion.div
                  className="aspect-[2/3] bg-slate-200 rounded-xl overflow-hidden"
                  animate={skeletonVariants.animate}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-4 bg-slate-200 rounded-lg w-4/5"
                  animate={skeletonVariants.animate}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="h-3 bg-slate-200 rounded-lg w-2/3"
                  animate={skeletonVariants.animate}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : products.length > 0 ? (
          // PRODUCTS GRID
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {products.map((product, idx) => (
                  <motion.div
                    key={`${product.id}-${idx}`}
                    className="group cursor-pointer"
                    variants={cardVariants}
                    exit="exit"
                  >
                    {/* CARD CONTAINER */}
                    <motion.div
                      className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
                      whileHover={{ y: -8 }}
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-[2/3] bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Grid3x3 className="w-12 h-12" />
                          </div>
                        )}

                        {/* PROMO BADGE */}
                        {product.promo && (
                          <motion.div
                            className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            {product.promo}
                          </motion.div>
                        )}

                        {/* FAVORITE BUTTON */}
                        <motion.button
                          className="absolute top-3 right-3 p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                          onClick={() => toggleFavorite(product.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart
                            className={`w-5 h-5 transition-all ${
                              favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-slate-600"
                            }`}
                          />
                        </motion.button>
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <motion.h3
                            className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors"
                            whileHover={{ x: 2 }}
                          >
                            {product.title}
                          </motion.h3>
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{product.author}</p>
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <motion.span
                            className="text-base font-bold text-emerald-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            {product.price}
                          </motion.span>
                          <motion.button
                            className="p-2.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* LOAD MORE BUTTON */}
            <motion.div
              className="mt-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleLoadMore}
                disabled={isCrawlingMore}
                className="bg-slate-900 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 mx-auto shadow-lg hover:shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCrawlingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCrawlingMore ? "Loading More..." : "Load More Books"}
              </motion.button>
            </motion.div>
          </>
        ) : (
          // EMPTY STATE
          <motion.div className="text-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid3x3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-600">No books found</h2>
            <p className="text-slate-500 mt-2">Try another category</p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
