import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Trash2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const { data: cartItems, isLoading, refetch } = trpc.cart.getItems.useQuery();
  const removeItemMutation = trpc.cart.removeItem.useMutation();
  const updateItemMutation = trpc.cart.updateItem.useMutation();

  const handleRemoveItem = async (id: number) => {
    try {
      await removeItemMutation.mutateAsync({ id });
      refetch();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    try {
      await updateItemMutation.mutateAsync({ id, quantity });
      refetch();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : cartItems && cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items ({cartItems.length})</span>
                      <span>${calculateTotal(cartItems).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${calculateTotal(cartItems).toFixed(2)}</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <a>
                      <Button className="w-full mb-3">
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </Link>

                  <Link href="/shop">
                    <a>
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </a>
                  </Link>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">Your cart is empty</p>
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

function CartItemRow({ item, onRemove, onUpdateQuantity }: any) {
  const { data: product, isLoading } = trpc.products.getById.useQuery({ id: item.productId });

  if (isLoading) {
    return (
      <Card className="p-4 md:p-6">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-lg flex-shrink-0 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <Link href={`/product/${item.productId}`}>
            <a className="font-semibold text-lg hover:text-primary transition-colors">
              {product.name}
            </a>
          </Link>
          <p className="text-muted-foreground text-sm mb-2">
            {product.size && `Size: ${product.size}`}
          </p>
          <p className="text-lg font-bold text-primary mb-4">
            ${product.price}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                }
                className="w-8 h-8 rounded border border-border hover:bg-secondary transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  onUpdateQuantity(item.id, item.quantity + 1)
                }
                className="w-8 h-8 rounded border border-border hover:bg-secondary transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="ml-auto p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function calculateTotal(cartItems: any[]) {
  // This is a placeholder - actual total calculation should be done server-side
  // For now, we'll return a placeholder value
  return cartItems.reduce((sum, item) => sum + item.quantity * 10, 0);
}
