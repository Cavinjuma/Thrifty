import { useState } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const [, navigate] = useLocation();
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  const { data: cartItems } = trpc.cart.getItems.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation();

  const totalPrice = cartItems?.reduce((sum: number, item) => {
    return sum + (item.quantity * 10); // Placeholder - should fetch actual product price
  }, 0) || 0;

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        shippingAddress,
        notes: notes || undefined,
      });
      toast.success("Order placed successfully!");
      // Redirect to confirmation page with order ID
      setTimeout(() => {
        const orderId = result?.id || "";
        navigate(`/order-confirmation?orderId=${orderId}`);
      }, 500);
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  // Removed inline confirmation - now using dedicated OrderConfirmation page

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Shipping Address *
                    </label>
      <textarea
        value={shippingAddress}
        onChange={(e) => setShippingAddress(e.target.value)}
        placeholder="Enter your full shipping address"
        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        rows={4}
      />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions or notes for your order"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items ({cartItems?.length || 0})</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending || !cartItems || cartItems.length === 0}
                  className="w-full"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
