import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, Heart, Loader2, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: products, isLoading } = trpc.products.getAvailable.useQuery({
    limit: 100,
  });
  const addToWishlistMutation = trpc.wishlist.addItem.useMutation();
  const addToCartMutation = trpc.cart.addItem.useMutation();
  const [wishlistItems, setWishlistItems] = useState<Set<number>>(new Set());

  const handleAddToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    try {
      await addToWishlistMutation.mutateAsync({ productId });
      setWishlistItems((prev) => new Set(prev).add(productId));
      toast.success("Added to wishlist!");
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <MainLayout>
      <div className="w-full">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-32 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="container relative z-10">
            <div className="max-w-3xl">
              <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30 mb-6">
                <span className="text-sm font-medium text-blue-200">
                  ✨ Sustainable Fashion Marketplace
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Discover Unique, Timeless Pieces
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
                Shop our carefully curated collection of premium thrifted clothing. Each piece tells a story of quality and sustainability.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <a>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Start Shopping
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                </Link>

                {isAuthenticated && user?.role === "admin" && (
                  <Link href="/admin/products">
                    <a>
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        <Lock className="w-5 h-5 mr-2" />
                        Manage Inventory
                      </Button>
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Available Now
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Browse our latest collection of hand-picked thrifted clothing, carefully selected for quality and style.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isInWishlist={wishlistItems.has(product.id)}
                      onAddToWishlist={handleAddToWishlist}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {products.length >= 100 && (
                  <div className="text-center mt-12">
                    <Link href="/shop">
                      <a>
                        <Button size="lg" variant="outline">
                          View All Products
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">
                  No products available yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Why Shop With Us Section */}
        <section className="py-16 md:py-24 bg-slate-50">
          <div className="container">
            <h2 className="text-4xl font-bold text-center mb-12">
              Why Shop With Us
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sustainable</h3>
                <p className="text-slate-600">
                  Give pre-loved clothing a second life and reduce fashion waste.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Unique Pieces</h3>
                <p className="text-slate-600">
                  Find one-of-a-kind items that express your individual style.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
                <p className="text-slate-600">
                  Every item is carefully inspected for quality and condition.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Access Footer */}
        {isAuthenticated && user?.role === "admin" && (
          <section className="py-12 bg-white border-t border-slate-200">
            <div className="container">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Admin Dashboard
                  </h3>
                  <p className="text-sm text-slate-600">
                    Manage your inventory and orders
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link href="/admin/products">
                    <a>
                      <Button variant="outline" size="sm">
                        Inventory
                      </Button>
                    </a>
                  </Link>
                  <Link href="/admin/orders">
                    <a>
                      <Button variant="outline" size="sm">
                        Orders
                      </Button>
                    </a>
                  </Link>
                  <Link href="/admin">
                    <a>
                      <Button size="sm">
                        Dashboard
                      </Button>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Next Favorite Piece?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our community of sustainable fashion enthusiasts and discover unique, timeless clothing.
            </p>

            <Link href="/shop">
              <a>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Explore Collection
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function ProductCard({
  product,
  isInWishlist,
  onAddToWishlist,
  onAddToCart,
}: {
  product: any;
  isInWishlist: boolean;
  onAddToWishlist: (id: number) => void;
  onAddToCart: (id: number) => void;
}) {
  if (product.isSold) {
    return null;
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/product/${product.id}`}>
        <a className="block">
          <div className="relative bg-slate-100 aspect-square overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-slate-300" />
              </div>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToWishlist(product.id);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                isInWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-slate-600 hover:bg-white"
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={isInWishlist ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-blue-600">
                ${product.price}
              </span>
              <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded capitalize">
                {product.condition}
              </span>
            </div>

            {product.size && (
              <p className="text-sm text-slate-600 mb-3">
                Size: <span className="font-medium">{product.size}</span>
              </p>
            )}
          </div>
        </a>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={() => onAddToCart(product.id)}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </Card>
  );
}
