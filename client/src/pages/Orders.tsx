import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Loader2, Calendar, DollarSign, Package } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Orders() {
  const { data: orders, isLoading } = trpc.orders.getUserOrders.useQuery();

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">My Orders</h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                      <p className="font-semibold">#{order.id}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Order Date
                      </p>
                      <p className="font-semibold">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Total
                      </p>
                      <p className="font-semibold text-primary text-lg">
                        ${order.totalAmount}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="mb-6 pb-6 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                      <p className="text-foreground">{order.shippingAddress}</p>
                    </div>
                  )}

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
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
