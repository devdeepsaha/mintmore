import { Providers } from "@/app/providers";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-surface-soft flex flex-col">
        <header className="h-16 bg-canvas border-b border-hairline-soft flex-shrink-0">
          <div className="content-container h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
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
            <Link
              href="/"
              className="text-body-sm text-muted hover:text-ink transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          {children}
        </div>
      </div>
    </Providers>
  );
}