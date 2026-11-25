import Image from "next/image";
import { AppImages } from "@/lib/app_images";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works-steps" },
      { label: "For owners", href: "#for-owners" },
      { label: "For providers", href: "#for-providers" },
      { label: "Disputes", href: "#disputes" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Stellar explorer", href: "#" },
      { label: "About USDC", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
          <div className="max-w-md">
            <a href="#" className="inline-flex items-center">
              <Image
                src={AppImages.logo}
                alt="PayMilestone"
                width={150}
                height={30}
                className="h-7 w-auto"
              />
            </a>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Get paid as the work gets done. Milestone escrow in USDC for
              owners and the providers they already trust.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-zinc-950">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-zinc-600 transition-colors hover:text-zinc-950"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 sm:mt-12">
          <div className="flex flex-col gap-3 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 PayMilestone</p>
            <p className="sm:text-right">
              Payments in USDC on Stellar, held by Soroban escrow
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
