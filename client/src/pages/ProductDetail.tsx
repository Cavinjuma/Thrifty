import { useState } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Heart, Loader2, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Extract product ID from URL
  const productId = parseInt(window.location.pathname.split("/").pop() || "0");

  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: productId });
  const addToCartMutation = trpc.cart.addItem.useMutation();
  const addToWishlistMutation = trpc.wishlist.addItem.useMutation();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId,
        quantity,
      });
      toast.success(`Added ${quantity} item(s) to cart`);
      setQuantity(1);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use wishlist");
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        toast.success("Removed from wishlist");
      } else {
        await addToWishlistMutation.mutateAsync({ productId });
        toast.success("Added to wishlist");
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-12 flex justify-center items-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/shop")}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
          <div className="text-center">
            <p className="text-muted-foreground">Product not found</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/shop")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-secondary rounded-lg overflow-hidden aspect-square flex items-center justify-center mb-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <span className="text-sm font-medium bg-accent text-accent-foreground px-3 py-1 rounded capitalize">
                      {product.condition}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-lg transition-colors ${
                    isWishlisted
                      ? "bg-red-100 text-red-600"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                {product.category && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Category</p>
                    <p className="font-medium capitalize">{product.category}</p>
                  </div>
                )}

                {product.size && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Size</p>
                    <p className="font-medium">{product.size}</p>
                  </div>
                )}

                {product.condition && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Condition</p>
                    <p className="font-medium capitalize">{product.condition}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart Section */}
            {!product.isSold ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      −
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-border hover:bg-secondary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="w-full"
                >
                  {addToCartMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Card className="p-6 bg-muted border-muted">
                <p className="text-center font-semibold text-muted-foreground">
                  This item has been sold
                </p>
              </Card>
            )}

            {/* Shipping Info */}
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold mb-4">Shipping & Returns</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Free shipping on orders over $50</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>30-day returns for unworn items</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Secure packaging and tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
