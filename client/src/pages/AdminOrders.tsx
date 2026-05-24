import { useState } from "react";
import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const { data: orders, isLoading, refetch } = trpc.orders.getAllOrders.useQuery();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: newStatus,
      });
      refetch();
      toast.success("Order status updated!");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      pending: "confirmed",
      confirmed: "shipped",
      shipped: "delivered",
      delivered: "delivered",
      cancelled: "cancelled",
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <MainLayout>
        <div className="container py-12">
          <div className="mb-8">
            <Link href="/admin">
              <a className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </a>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">Order Management</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                            STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Order Date</p>
                          <p className="font-semibold">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-semibold text-primary text-lg">
                            ${order.totalAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Customer ID</p>
                          <p className="font-semibold">{order.userId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Updated</p>
                          <p className="font-semibold">
                            {new Date(order.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {order.shippingAddress && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                          <p className="text-foreground">{order.shippingAddress}</p>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-1">Order Notes</p>
                          <p className="text-foreground">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setExpandedOrder(expandedOrder === order.id ? null : order.id)
                      }
                      className="text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      {expandedOrder === order.id ? "Hide" : "Show"} Details
                    </button>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="border-t border-border pt-4 flex flex-wrap gap-2">
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(
                              order.id,
                              getNextStatus(order.status) as any
                            )
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            `Mark as ${getNextStatus(order.status)}`
                          )}
                        </Button>

                        {order.status !== "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </>
                    )}

                    {(order.status === "delivered" || order.status === "cancelled") && (
                      <p className="text-sm text-muted-foreground">
                        {order.status === "delivered"
                          ? "Order has been delivered"
                          : "Order has been cancelled"}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
