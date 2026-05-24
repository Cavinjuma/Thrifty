import { useState } from "react";
import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, CheckCircle, Loader2, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  size: string;
  condition: "excellent" | "good" | "fair" | "poor";
}

export default function AdminProducts() {
  const { data: products, isLoading, refetch } = trpc.products.getByOwner.useQuery();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const markAsSoldMutation = trpc.products.markAsSold.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    category: "Tops",
    size: "",
    condition: "excellent",
  });

  const createProductMutation = trpc.products.create.useMutation();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Tops",
      size: "",
      condition: "excellent",
    });
    setEditingId(null);
  };

  const handleEditProduct = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      size: product.size || "",
      condition: product.condition,
    });
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        // Update existing product
        await updateProductMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          size: formData.size,
          condition: formData.condition,
        });
        toast.success("Product updated successfully!");
      } else {
        // Create new product
        await createProductMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          size: formData.size,
          condition: formData.condition,
        });
        toast.success("Product added successfully!");
      }
      resetForm();
      setShowAddForm(false);
      refetch();
    } catch (error) {
      toast.error(editingId ? "Failed to update product" : "Failed to add product");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductMutation.mutateAsync({ id });
      refetch();
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleMarkAsSold = async (id: number) => {
    try {
      await markAsSoldMutation.mutateAsync({ id });
      refetch();
      toast.success("Product marked as sold!");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <MainLayout>
        <div className="container py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/admin">
                <a className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </a>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">Inventory Management</h1>
            </div>
            <Button onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              {showAddForm && !editingId ? "Cancel" : "Add Product"}
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price *
                  </label>
                  <Input
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="Enter price"
                    type="number"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Tops</option>
                    <option>Bottoms</option>
                    <option>Dresses</option>
                    <option>Outerwear</option>
                    <option>Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Size
                  </label>
                  <Input
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    placeholder="e.g., M, L, XL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condition: e.target.value as "excellent" | "good" | "fair" | "poor",
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter product description"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleSaveProduct}
                  disabled={
                    createProductMutation.isPending || updateProductMutation.isPending
                  }
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {editingId ? "Update Product" : "Add Product"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Products List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid gap-4">
              {products.map((product: any) => (
                <Card key={product.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">Price:</span> ${product.price}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {product.category}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {product.size || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Condition:</span>{" "}
                          <span className="capitalize">{product.condition}</span>
                        </div>
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {product.description}
                        </p>
                      )}
                      {product.isSold && (
                        <div className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Sold
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap md:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        disabled={product.isSold}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsSold(product.id)}
                        disabled={product.isSold}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Sold
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No products yet</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </Card>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
