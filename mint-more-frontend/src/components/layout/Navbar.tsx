"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Freelancers", href: "#freelancers" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas border-b border-hairline-soft">
      <div className="content-container">
        <nav className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-on-primary text-xs font-bold">M</span>
            </div>
            <span
              className="text-ink font-semibold text-[15px]"
              style={{ letterSpacing: "-0.3px" }}
            >
              Mint More
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-nav-link text-muted px-3 py-2 rounded-md transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA cluster */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-nav-link text-muted font-medium hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-ink"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="md:hidden bg-canvas border-t border-hairline-soft">
          <div className="content-container py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-md text-muted px-3 py-3 rounded-md hover:text-ink hover:bg-surface-soft transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-hairline-soft mt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="text-body-md text-muted px-3 py-3 hover:text-ink transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm w-full text-center"
                onClick={() => setMobileOpen(false)}
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}