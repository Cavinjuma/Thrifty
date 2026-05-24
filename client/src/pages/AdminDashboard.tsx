import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: products } = trpc.products.getByOwner.useQuery();
  const { data: orders } = trpc.orders.getAllOrders.useQuery();

  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum: number, order) => {
    return sum + parseFloat(order.totalAmount.toString());
  }, 0) || 0;

  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;

  return (
    <ProtectedRoute requiredRole="admin">
      <MainLayout>
        <div className="container py-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your inventory and orders
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                  <p className="text-3xl font-bold">{totalProducts}</p>
                </div>
                <Package className="w-10 h-10 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-3xl font-bold">{totalOrders}</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold">{pendingOrders}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-primary opacity-20" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8">
              <h2 className="text-xl font-bold mb-4">Inventory Management</h2>
              <p className="text-muted-foreground mb-6">
                Add new items to your store, edit existing listings, or mark items as sold.
              </p>
              <Link href="/admin/products">
                <a>
                  <Button className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Button>
                </a>
              </Link>
            </Card>

            <Card className="p-8">
              <h2 className="text-xl font-bold mb-4">Order Management</h2>
              <p className="text-muted-foreground mb-6">
                View incoming orders, update their status, and manage customer requests.
              </p>
              <Link href="/admin/orders">
                <a>
                  <Button className="w-full">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Manage Orders
                  </Button>
                </a>
              </Link>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
