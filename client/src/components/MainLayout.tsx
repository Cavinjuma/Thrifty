import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Heart, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <a className="flex items-center gap-2 font-bold text-2xl text-foreground hover:text-primary transition-colors">
                <ShoppingBag className="w-6 h-6" />
                <span>Cloth Thrift</span>
              </a>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/">
                <a className={`text-sm font-medium transition-colors ${isActive("/") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                  Shop
                </a>
              </Link>

              {isAdmin ? (
                <>
                  <Link href="/admin">
                    <a className={`text-sm font-medium transition-colors ${isActive("/admin") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/admin/products">
                    <a className={`text-sm font-medium transition-colors ${isActive("/admin/products") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                      Inventory
                    </a>
                  </Link>
                  <Link href="/admin/orders">
                    <a className={`text-sm font-medium transition-colors ${isActive("/admin/orders") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                      Orders
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/cart">
                    <a className={`text-sm font-medium transition-colors ${isActive("/cart") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                      Cart
                    </a>
                  </Link>
                  <Link href="/wishlist">
                    <a className={`text-sm font-medium transition-colors ${isActive("/wishlist") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                      Wishlist
                    </a>
                  </Link>
                  <Link href="/orders">
                    <a className={`text-sm font-medium transition-colors ${isActive("/orders") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                      Orders
                    </a>
                  </Link>
                </>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/profile">
                    <a className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </a>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-border space-y-3">
              <Link href="/">
                <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Shop
                </a>
              </Link>

              {isAdmin ? (
                <>
                  <Link href="/admin">
                    <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/admin/products">
                    <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Inventory
                    </a>
                  </Link>
                  <Link href="/admin/orders">
                    <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Orders
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/cart">
                    <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Cart
                    </a>
                  </Link>
                  <Link href="/wishlist">
                    <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Wishlist
                    </a>
                  </Link>
                  <Link href="/orders">
                    <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Orders
                    </a>
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link href="/profile">
                    <a className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Profile
                    </a>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <ShoppingBag className="w-5 h-5" />
                <span>Cloth Thrift</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover unique, sustainable fashion through our curated collection of thrifted clothing.
              </p>
            </div>

            {/* Shop */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/">
                    <a className="hover:text-foreground transition-colors">All Items</a>
                  </Link>
                </li>
                <li>
                  <Link href="/">
                    <a className="hover:text-foreground transition-colors">New Arrivals</a>
                  </Link>
                </li>
                <li>
                  <Link href="/">
                    <a className="hover:text-foreground transition-colors">Sale</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-sm mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Cloth Thrift. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Instagram
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
