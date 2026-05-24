import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Wishlist() {
  const { data: wishlistItems, isLoading, refetch } = trpc.wishlist.getItems.useQuery();
  const removeItemMutation = trpc.wishlist.removeItem.useMutation();

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItemMutation.mutateAsync({ productId });
      refetch();
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">My Wishlist</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : wishlistItems && wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
              <Link href="/shop">
                <a>
                  <Button>Start Shopping</Button>
                </a>
              </Link>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

function WishlistItemCard({ item, onRemove }: any) {
  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: item.productId });

  if (isLoading) {
    return (
      <div className="bg-secondary rounded-lg overflow-hidden aspect-square flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="group">
      <Link href={`/product/${item.productId}`}>
        <a className="block">
          <div className="bg-secondary rounded-lg overflow-hidden mb-4 aspect-square flex items-center justify-center relative">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove(item.productId);
              }}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>

          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-primary">
              ${product.price}
            </span>
            <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-1 rounded capitalize">
              {product.condition}
            </span>
          </div>

          {product.size && (
            <p className="text-sm text-muted-foreground mb-3">
              Size: {product.size}
            </p>
          )}
        </a>
      </Link>

      <Link href={`/product/${item.productId}`}>
        <a>
          <Button className="w-full" size="sm">
            <ShoppingBag className="w-4 h-4 mr-2" />
            View Item
          </Button>
        </a>
      </Link>
    </div>
  );
}
