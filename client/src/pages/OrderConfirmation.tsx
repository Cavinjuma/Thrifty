import { useLocation } from "wouter";
import { useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, Home } from "lucide-react";
import { Link } from "wouter";

export default function OrderConfirmation() {
  const [, navigate] = useLocation();

  // Get order ID from URL params if available
  const orderId = new URLSearchParams(window.location.search).get("orderId");

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
                <CheckCircle className="w-24 h-24 text-green-600 relative" />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Thank you for your purchase
            </p>
            {orderId && (
              <p className="text-lg font-semibold text-primary">
                Order ID: #{orderId}
              </p>
            )}
          </div>

          {/* Order Details */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">What's Next?</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Order Processing</h3>
                  <p className="text-muted-foreground">
                    Your order is being prepared for shipment. We'll send you a confirmation email with tracking information shortly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <span className="text-lg font-bold text-primary">📧</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Check Your Email</h3>
                  <p className="text-muted-foreground">
                    A confirmation email has been sent to your registered email address with order details and shipping information.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                    <span className="text-lg font-bold text-primary">🚚</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Track Your Order</h3>
                  <p className="text-muted-foreground">
                    Visit your account page to track your order status and view shipping updates in real-time.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <a>
                <Button size="lg" className="w-full sm:w-auto">
                  <Package className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
              </a>
            </Link>

            <Link href="/shop">
              <a>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </a>
            </Link>
          </div>

          {/* FAQ Section */}
          <Card className="p-8 mt-12 bg-secondary/50">
            <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>

            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">How long will my order take to arrive?</p>
                <p className="text-muted-foreground">
                  Most orders are shipped within 2-3 business days and arrive within 5-7 business days depending on your location.
                </p>
              </div>

              <div>
                <p className="font-semibold mb-2">Can I modify or cancel my order?</p>
                <p className="text-muted-foreground">
                  Orders can be modified or cancelled within 24 hours of placement. Please contact support immediately if you need to make changes.
                </p>
              </div>

              <div>
                <p className="font-semibold mb-2">What's your return policy?</p>
                <p className="text-muted-foreground">
                  We offer a 30-day return policy for unworn items in original condition. Please refer to our returns page for more details.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
