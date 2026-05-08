import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "For Freelancers", href: "#freelancers" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Client Dashboard", href: "/login" },
      { label: "Freelancer Dashboard", href: "/login" },
      { label: "Admin Panel", href: "/login" },
      { label: "KYC Verification", href: "/register" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-surface-dark">
      <div className="content-container py-16">
        {/* Top: Logo + columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-on-dark flex items-center justify-center">
                <span className="text-surface-dark text-xs font-bold">M</span>
              </div>
              <span
                className="text-on-dark font-semibold text-base"
                style={{ letterSpacing: "-0.3px" }}
              >
                Mint More
              </span>
            </div>
            <p className="text-body-sm text-on-dark-soft leading-relaxed">
              Controlled matchmaking for clients and freelancers. No noise, just
              the right match.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-caption text-on-dark font-semibold uppercase tracking-wider mb-4">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-on-dark-soft hover:text-on-dark transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-surface-dark-elevated flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-body-sm text-on-dark-soft">
            © {new Date().getFullYear()} Mint More. All rights reserved.
          </p>
          <p className="text-body-sm text-on-dark-soft">
            Built for the Indian freelance market · Prices in ₹ INR
          </p>
        </div>
      </div>
    </footer>
  );
}