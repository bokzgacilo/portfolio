"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CreditCard,
  Heart,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Storefront } from "./data";

type StorefrontView = "home" | "plp" | "pdp" | "cart" | "checkout" | "account";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  color: string;
  badge: string;
  image: string;
};

const products: Product[] = [
  {
    id: "jacket",
    name: "Structured Nylon Jacket",
    category: "Outerwear",
    price: 188,
    compareAt: 220,
    color: "Graphite",
    badge: "New arrival",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "tote",
    name: "Box Canvas Tote",
    category: "Accessories",
    price: 72,
    color: "Bone",
    badge: "Low stock",
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "trouser",
    name: "Washed Pleat Trouser",
    category: "Bottoms",
    price: 128,
    color: "Coal",
    badge: "Best seller",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=82",
  },
  {
    id: "tee",
    name: "Heavyweight Box Tee",
    category: "Tops",
    price: 54,
    color: "White",
    badge: "Core",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=82",
  },
];

const cartSeed = [
  { productId: "jacket", quantity: 1, size: "M" },
  { productId: "tote", quantity: 1, size: "OS" },
];

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <article className="group/product min-w-0">
      <button className="block w-full cursor-pointer text-left" type="button" onClick={onOpen}>
        <span className="relative block overflow-hidden bg-[#ebe4d8]">
          <img
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover/product:scale-[1.035]"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
          <span className="absolute top-3 left-3 rounded-full bg-[#f9f5ee]/92 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#2a2520]">
            {product.badge}
          </span>
        </span>
        <span className="mt-3 grid gap-1">
          <span className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[#857d72]">
            {product.category}
          </span>
          <span className="flex items-start justify-between gap-3">
            <strong className="text-[1rem] leading-tight text-[#201c18]">{product.name}</strong>
            <span className="shrink-0 text-sm font-semibold text-[#201c18]">{money(product.price)}</span>
          </span>
          <span className="text-sm text-[#746c61]">{product.color}</span>
        </span>
      </button>
    </article>
  );
}

function StoreHeader({
  active,
  cartCount,
  menuOpen,
  onNavigate,
  onOpenCart,
  onToggleMenu,
}: {
  active: StorefrontView;
  cartCount: number;
  menuOpen: boolean;
  onNavigate: (view: StorefrontView) => void;
  onOpenCart: () => void;
  onToggleMenu: () => void;
}) {
  const navItems: ReadonlyArray<{ label: string; view: StorefrontView }> = [
    { label: "New", view: "home" },
    { label: "Shop", view: "plp" },
    { label: "Best Sellers", view: "plp" },
    { label: "Account", view: "account" },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#f9f5ee]/94 backdrop-blur-xl">
      <div className="bg-[#201c18] px-4 py-2 text-center text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#f9f5ee]">
        Free shipping over $150 / New season essentials now live
      </div>
      <div className="mx-auto flex min-h-18 w-full max-w-[1440px] items-center justify-between gap-4 px-[clamp(1rem,3vw,2rem)]">
        <div className="flex min-w-0 items-center gap-4">
          <button
            className="grid size-10 place-items-center rounded-full border border-[#d8cec0] bg-[#fffaf3] md:hidden"
            type="button"
            onClick={onToggleMenu}
            aria-label="Open storefront menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <button
            className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left text-[1.25rem] font-black uppercase tracking-[0.08em] text-[#201c18]"
            type="button"
            onClick={() => onNavigate("home")}
          >
            VANTA Studio
          </button>
        </div>

        <nav className="hidden items-center gap-7 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-[#746c61] md:flex">
          {navItems.map((item) => (
            <button
              className={cn(
                "cursor-pointer border-0 bg-transparent p-0 transition-colors hover:text-[#201c18]",
                active === item.view && "text-[#201c18]"
              )}
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.view)}
            >
              {item.label}
            </button>
          ))}
          <Link className="text-[#746c61] no-underline transition-colors hover:text-[#201c18]" href="/storefronts">
            Ideas
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden size-10 place-items-center rounded-full border border-[#d8cec0] bg-[#fffaf3] md:grid" type="button" aria-label="Search">
            <Search className="size-4" />
          </button>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#201c18] px-4 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#fffaf3]"
            type="button"
            onClick={onOpenCart}
          >
            <ShoppingBag className="size-4" />
            {cartCount}
          </button>
        </div>
      </div>

      <div className={cn("grid overflow-hidden border-t border-[#e3d9ca] transition-[grid-template-rows] md:hidden", menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <nav className="min-h-0 overflow-hidden px-4">
          <div className="grid py-3">
            {navItems.map((item) => (
              <button
                className="flex min-h-12 items-center justify-between border-b border-[#e3d9ca] text-left text-[0.82rem] font-bold uppercase tracking-[0.12em] text-[#201c18]"
                key={item.label}
                type="button"
                onClick={() => {
                  onNavigate(item.view);
                  onToggleMenu();
                }}
              >
                {item.label}
                <ChevronRight className="size-4" />
              </button>
            ))}
            <Link className="flex min-h-12 items-center border-b border-[#e3d9ca] text-[0.82rem] font-bold uppercase tracking-[0.12em] text-[#201c18] no-underline" href="/storefronts">
              Back to ideas
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function CartDrawer({
  open,
  cartItems,
  subtotal,
  shipping,
  total,
  onClose,
  onCheckout,
}: {
  open: boolean;
  cartItems: Array<{ product: Product; quantity: number; size: string }>;
  subtotal: number;
  shipping: number;
  total: number;
  onClose: () => void;
  onCheckout: () => void;
}) {
  return (
    <div className={cn("fixed inset-0 z-50 transition", open ? "visible" : "invisible")} aria-hidden={!open}>
      <button
        className={cn("absolute inset-0 bg-[#201c18]/45 transition-opacity", open ? "opacity-100" : "opacity-0")}
        type="button"
        onClick={onClose}
        aria-label="Close cart"
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 grid w-[min(94vw,440px)] grid-rows-[auto_1fr_auto] bg-[#fffaf3] shadow-[-24px_0_70px_rgb(32_28_24/0.2)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Cart drawer"
      >
        <div className="flex items-center justify-between border-b border-[#e3d9ca] p-5">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#857d72]">Your bag</p>
            <h3 className="mt-1 text-xl font-semibold text-[#201c18]">Cart drawer</h3>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-[#d8cec0]" type="button" onClick={onClose} aria-label="Close cart">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-auto p-5">
          <div className="grid gap-5">
            {cartItems.map((item) => (
              <div className="grid grid-cols-[82px_1fr_auto] gap-4" key={`${item.product.id}-${item.size}`}>
                <img className="aspect-[4/5] w-full rounded-sm object-cover" src={item.product.image} alt="" />
                <div className="min-w-0">
                  <p className="font-semibold leading-tight text-[#201c18]">{item.product.name}</p>
                  <p className="mt-1 text-sm text-[#746c61]">{item.product.color} / {item.size}</p>
                  <p className="mt-2 text-sm text-[#746c61]">Qty {item.quantity}</p>
                </div>
                <strong className="text-sm">{money(item.product.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e3d9ca] p-5">
          <div className="mb-4 grid gap-2 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></p>
            <p className="flex justify-between"><span>Shipping</span><strong>{shipping === 0 ? "Free" : money(shipping)}</strong></p>
            <p className="flex justify-between text-lg"><span>Total</span><strong>{money(total)}</strong></p>
          </div>
          <button className="min-h-12 w-full rounded-full bg-[#201c18] font-bold uppercase tracking-[0.1em] text-[#fffaf3]" type="button" onClick={onCheckout}>
            Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

export function StorefrontShowcase({ storefront }: { storefront: Storefront }) {
  const [activeView, setActiveView] = useState<StorefrontView>("home");
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState(cartSeed);

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number; size: string }>,
    [cart]
  );
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 12;
  const total = subtotal + shipping;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function navigate(view: StorefrontView) {
    setActiveView(view);
    setMenuOpen(false);
  }

  function openPdp(product: Product) {
    setSelectedProduct(product);
    navigate("pdp");
  }

  function addSelectedToCart() {
    setCart((current) => {
      const found = current.find((item) => item.productId === selectedProduct.id && item.size === "M");
      if (found) {
        return current.map((item) =>
          item.productId === selectedProduct.id && item.size === "M"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { productId: selectedProduct.id, quantity: 1, size: "M" }];
    });
    setDrawerOpen(true);
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  return (
    <section className="min-h-svh w-screen max-w-[100vw] overflow-x-hidden bg-[#f9f5ee] font-sans text-[#201c18]">
      <StoreHeader
        active={activeView}
        cartCount={cartCount}
        menuOpen={menuOpen}
        onNavigate={navigate}
        onOpenCart={() => setDrawerOpen(true)}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />

      {activeView === "home" ? (
        <>
          <section className="relative min-h-[calc(100svh_-_116px)] overflow-hidden">
            <img
              className="absolute inset-0 size-full object-cover"
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=82"
              alt="VANTA Studio seasonal campaign"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#201c18]/68 via-[#201c18]/24 to-transparent" />
            <div className="relative z-1 grid min-h-[calc(100svh_-_116px)] w-full content-end px-[clamp(1.2rem,5vw,5rem)] pb-[clamp(2rem,6vw,5rem)] text-[#fffaf3]">
              <p className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#efe5d6]">VANTA Studio / Drop 01</p>
              <h1 className="mt-4 max-w-[10ch] text-[clamp(3.2rem,9vw,9rem)] font-black uppercase leading-[0.86] tracking-normal">
                City Uniform
              </h1>
              <p className="mt-5 max-w-[44ch] text-[clamp(1rem,1.4vw,1.18rem)] leading-[1.7] text-[#f4ece1]">
                Elevated everyday layers for long routes, late plans, and quiet confidence.
              </p>
              <button className="mt-7 min-h-12 w-fit rounded-full bg-[#fffaf3] px-7 font-bold uppercase tracking-[0.12em] text-[#201c18]" type="button" onClick={() => navigate("plp")}>
                Shop new arrivals
              </button>
            </div>
          </section>

          <section className="mx-auto grid w-[min(100%_-_2rem,1440px)] gap-7 py-[clamp(3rem,7vw,6rem)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.76rem] font-bold uppercase tracking-[0.16em] text-[#857d72]">Featured collection</p>
                <h2 className="mt-2 text-[clamp(2rem,5vw,4.5rem)] font-semibold leading-none tracking-normal">New season essentials</h2>
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em]" type="button" onClick={() => navigate("plp")}>
                View all <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-[clamp(1rem,2vw,1.5rem)] max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">
              {products.map((product) => (
                <ProductCard product={product} key={product.id} onOpen={() => openPdp(product)} />
              ))}
            </div>
          </section>

          <section className="grid grid-cols-3 border-y border-[#e3d9ca] bg-[#fffaf3] max-[820px]:grid-cols-1">
            {["Free shipping over $150", "Easy 14-day returns", "Ships from VANTA Studio"].map((item) => (
              <div className="flex min-h-28 items-center gap-3 border-r border-[#e3d9ca] px-[clamp(1.2rem,4vw,3rem)] last:border-r-0 max-[820px]:border-r-0 max-[820px]:border-b" key={item}>
                <Check className="size-5 text-[#201c18]" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </section>
        </>
      ) : null}

      {activeView === "plp" ? (
        <main className="mx-auto grid w-[min(100%_-_2rem,1440px)] grid-cols-[240px_minmax(0,1fr)] gap-8 py-[clamp(2rem,5vw,4rem)] max-[900px]:grid-cols-1">
          <aside className="min-w-0">
            <div className="sticky top-32 grid gap-5 max-[900px]:static">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <SlidersHorizontal className="size-4" />
              </div>
              {["Category", "Size", "Color", "Availability", "Price"].map((filter) => (
                <details className="border-t border-[#e3d9ca] py-4" key={filter}>
                  <summary className="cursor-pointer text-sm font-bold uppercase tracking-[0.12em]">{filter}</summary>
                  <p className="mt-3 text-sm text-[#746c61]">Dummy filter values</p>
                </details>
              ))}
            </div>
          </aside>
          <section className="min-w-0">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-[#857d72]">Apparel / clothing</p>
                <h1 className="mt-2 text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-none">Shop all</h1>
              </div>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d8cec0] bg-[#fffaf3] px-5 text-sm font-bold uppercase tracking-[0.1em]" type="button">
                <Search className="size-4" />
                Search
              </button>
            </div>
            <div className="grid grid-cols-3 gap-[clamp(1rem,2vw,1.5rem)] max-[1050px]:grid-cols-2 max-[600px]:grid-cols-1">
              {products.map((product) => (
                <ProductCard product={product} key={product.id} onOpen={() => openPdp(product)} />
              ))}
            </div>
          </section>
        </main>
      ) : null}

      {activeView === "pdp" ? (
        <main className="mx-auto grid w-[min(100%_-_2rem,1440px)] grid-cols-[minmax(0,1fr)_minmax(320px,440px)] gap-[clamp(1.5rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)] max-[920px]:grid-cols-1">
          <section className="grid min-w-0 grid-cols-2 gap-4 max-[640px]:grid-cols-1">
            {[selectedProduct.image, "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=82"].map((image) => (
              <img className="aspect-[4/5] w-full rounded-sm bg-[#ebe4d8] object-cover" src={image} alt="" key={image} />
            ))}
          </section>
          <aside className="min-w-0">
            <div className="sticky top-32 grid gap-6 max-[920px]:static">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#857d72]">{selectedProduct.category}</p>
              <div>
                <h1 className="text-[clamp(2.1rem,5vw,4.5rem)] font-semibold leading-none">{selectedProduct.name}</h1>
                <div className="mt-4 flex items-center gap-3 text-lg">
                  <strong>{money(selectedProduct.price)}</strong>
                  {selectedProduct.compareAt ? <span className="text-[#958c81] line-through">{money(selectedProduct.compareAt)}</span> : null}
                </div>
              </div>
              <p className="leading-7 text-[#62594f]">
                A polished Shopify-style PDP with large imagery, size selection,
                variant context, product notes, and a cart drawer interaction.
              </p>
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#857d72]">Size</p>
                <div className="grid grid-cols-5 gap-2">
                  {["XS", "S", "M", "L", "XL"].map((size) => (
                    <button className={cn("min-h-11 rounded-full border border-[#d8cec0] font-semibold", size === "M" && "border-[#201c18] bg-[#201c18] text-[#fffaf3]")} key={size} type="button">
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <button className="min-h-13 rounded-full bg-[#201c18] px-7 font-bold uppercase tracking-[0.12em] text-[#fffaf3]" type="button" onClick={addSelectedToCart}>
                Add to bag
              </button>
              <button className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#d8cec0] px-5 font-semibold" type="button">
                <Heart className="size-4" />
                Add to wishlist
              </button>
            </div>
          </aside>
        </main>
      ) : null}

      {activeView === "cart" ? (
        <main className="mx-auto grid w-[min(100%_-_2rem,1180px)] grid-cols-[minmax(0,1fr)_360px] gap-10 py-[clamp(2rem,5vw,4rem)] max-[900px]:grid-cols-1">
          <section className="min-w-0">
            <h1 className="mb-8 text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-none">Shopping bag</h1>
            <div className="grid gap-5">
              {cartItems.map((item) => (
                <div className="grid grid-cols-[110px_minmax(0,1fr)_auto] gap-5 border-b border-[#e3d9ca] pb-5 max-[620px]:grid-cols-[92px_minmax(0,1fr)]" key={`${item.product.id}-${item.size}`}>
                  <img className="aspect-[4/5] w-full rounded-sm object-cover" src={item.product.image} alt="" />
                  <div className="min-w-0">
                    <h2 className="font-semibold">{item.product.name}</h2>
                    <p className="mt-1 text-sm text-[#746c61]">{item.product.color} / {item.size}</p>
                    <div className="mt-5 inline-flex rounded-full border border-[#d8cec0]">
                      <button className="grid size-9 place-items-center" type="button" onClick={() => changeQuantity(item.product.id, -1)} aria-label="Decrease quantity">
                        <Minus className="size-4" />
                      </button>
                      <span className="grid min-w-10 place-items-center border-x border-[#d8cec0] font-semibold">{item.quantity}</span>
                      <button className="grid size-9 place-items-center" type="button" onClick={() => changeQuantity(item.product.id, 1)} aria-label="Increase quantity">
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <strong>{money(item.product.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </section>
          <aside className="h-fit rounded-sm bg-[#fffaf3] p-6 shadow-[0_18px_50px_rgb(32_28_24/0.08)]">
            <h2 className="text-xl font-semibold">Order summary</h2>
            <div className="my-5 grid gap-3 border-y border-[#e3d9ca] py-5">
              <p className="flex justify-between"><span>Subtotal</span><strong>{money(subtotal)}</strong></p>
              <p className="flex justify-between"><span>Shipping</span><strong>{shipping === 0 ? "Free" : money(shipping)}</strong></p>
              <p className="flex justify-between text-lg"><span>Total</span><strong>{money(total)}</strong></p>
            </div>
            <button className="min-h-12 w-full rounded-full bg-[#201c18] font-bold uppercase tracking-[0.12em] text-[#fffaf3]" type="button" onClick={() => navigate("checkout")}>
              Checkout
            </button>
          </aside>
        </main>
      ) : null}

      {activeView === "checkout" ? (
        <main className="mx-auto grid w-[min(100%_-_2rem,1180px)] grid-cols-[minmax(0,1fr)_360px] gap-10 py-[clamp(2rem,5vw,4rem)] max-[900px]:grid-cols-1">
          <section className="grid min-w-0 gap-4">
            <h1 className="mb-3 text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-none">Checkout</h1>
            {["Contact", "Shipping address", "Delivery method", "Payment"].map((step, index) => (
              <section className="rounded-sm border border-[#e3d9ca] bg-[#fffaf3] p-5" key={step}>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#857d72]">Step {index + 1}</p>
                <h2 className="mb-4 text-lg font-semibold">{step}</h2>
                <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
                  <span className="min-h-12 rounded-sm border border-[#d8cec0] px-3 py-3 text-[#857d72]">Dummy field</span>
                  <span className="min-h-12 rounded-sm border border-[#d8cec0] px-3 py-3 text-[#857d72]">Dummy field</span>
                </div>
              </section>
            ))}
          </section>
          <aside className="h-fit rounded-sm bg-[#201c18] p-6 text-[#fffaf3]">
            <CreditCard className="mb-5 size-7" />
            <h2 className="text-xl font-semibold">Secure checkout</h2>
            <div className="my-5 grid gap-3 border-y border-[#fffaf3]/18 py-5">
              <p className="flex justify-between"><span>Items</span><strong>{cartCount}</strong></p>
              <p className="flex justify-between"><span>Shipping</span><strong>{shipping === 0 ? "Free" : money(shipping)}</strong></p>
              <p className="flex justify-between text-lg"><span>Total</span><strong>{money(total)}</strong></p>
            </div>
            <button className="min-h-12 w-full rounded-full bg-[#fffaf3] font-bold uppercase tracking-[0.12em] text-[#201c18]" type="button">
              Place sample order
            </button>
          </aside>
        </main>
      ) : null}

      {activeView === "account" ? (
        <main className="mx-auto grid w-[min(100%_-_2rem,1180px)] grid-cols-[320px_minmax(0,1fr)] gap-8 py-[clamp(2rem,5vw,4rem)] max-[860px]:grid-cols-1">
          <aside className="h-fit rounded-sm bg-[#fffaf3] p-6 shadow-[0_18px_50px_rgb(32_28_24/0.08)]">
            <UserRound className="mb-5 size-9" />
            <h1 className="text-3xl font-semibold leading-none">Mika Santos</h1>
            <p className="mt-3 text-sm uppercase tracking-[0.14em] text-[#857d72]">VANTA member / since 2026</p>
          </aside>
          <section className="min-w-0">
            <h2 className="mb-5 text-2xl font-semibold">Recent orders</h2>
            <div className="grid gap-3">
              {[
                ["#VS-1048", "Fulfilled", "$260.00"],
                ["#VS-1039", "In transit", "$128.00"],
                ["#VS-1011", "Returned", "$72.00"],
              ].map(([order, status, amount]) => (
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-sm border border-[#e3d9ca] bg-[#fffaf3] p-4 max-[560px]:grid-cols-1" key={order}>
                  <PackageCheck className="size-5 text-[#201c18]" />
                  <div>
                    <p className="font-semibold">{order}</p>
                    <p className="text-sm text-[#746c61]">{status}</p>
                  </div>
                  <strong>{amount}</strong>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : null}

      <CartDrawer
        open={drawerOpen}
        cartItems={cartItems}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        onClose={() => setDrawerOpen(false)}
        onCheckout={() => {
          setDrawerOpen(false);
          navigate("checkout");
        }}
      />
    </section>
  );
}
