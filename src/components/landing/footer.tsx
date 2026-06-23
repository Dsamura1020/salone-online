import Link from "next/link";
import { Brand } from "./brand";
import { MailIcon, PinIcon } from "./icons";

const platformLinks = [
  { label: "Browse Businesses", href: "/businesses" },
  {
    label: "Register Business",
    href: "/login?mode=register-business&callbackUrl=/dashboard/owner/businesses/new",
  },
  { label: "Categories", href: "#categories" },
  { label: "How It Works", href: "#how-it-works" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Support", href: "#contact" },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-[#111d63] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Brand tone="dark" showSubtitle={false} />
          <p className="mt-3 max-w-xs text-sm font-medium leading-6 text-white/62">
            Discover verified businesses with AI-powered Web search across Sierra Leone.
          </p>
        </div>

        <FooterColumn title="Platform" links={platformLinks} />
        <FooterColumn title="Company" links={companyLinks} />

        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.18em]">
            Contact
          </h3>
          <div className="mt-4 space-y-3 text-sm font-semibold text-white/62">
            <p className="flex items-center gap-2">
              <PinIcon className="size-4" />
              Freetown, Sierra Leone
            </p>
            <p className="flex items-center gap-2">
              <MailIcon className="size-4" />
              hello@SaloneOnline.sl
            </p>
            <p>+1(240)319-2582</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-xs font-semibold text-white/45">
          <p className="shrink-0">© 2026 SaloneOnline. Built for Sierra Leone.</p>
          <p className="text-right">Powered by Daniel Samura </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-[0.18em]">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm font-semibold text-white/62 transition hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
