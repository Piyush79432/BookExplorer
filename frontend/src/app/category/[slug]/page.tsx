'use client';

import { useEffect, useState, use } from 'react'; // Added 'use'
import { ArrowLeft, Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface Product {
  title: string;
  price: string;
  image: string;
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      // In real life, slug might need formatting (e.g. "fiction-books")
      // For this demo, we assume the slug passed is valid for WOB
      const res = await fetch(`http://localhost:3001/products?category=${slug}`);
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    }
    
    if (slug) fetchProducts();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-100 transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold capitalize text-slate-900">
            {slug.replace(/-/g, ' ')}
          </h1>
        </div>

        {loading ? (
           // Skeleton Grid
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 h-80 animate-pulse">
                 <div className="bg-slate-200 w-full h-48 rounded-lg mb-4"></div>
                 <div className="bg-slate-200 w-3/4 h-4 rounded mb-2"></div>
                 <div className="bg-slate-200 w-1/2 h-4 rounded"></div>
               </div>
             ))}
           </div>
        ) : (
          // Product Grid
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-lg transition group">
                <div className="relative aspect-[2/3] mb-4 bg-slate-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image || '/placeholder.png'} 
                    alt={product.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                  />
                </div>
                
                <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 h-12 text-sm">
                  {product.title}
                </h3>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-emerald-700 font-bold text-lg">
                    {product.price}
                  </span>
                  <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}