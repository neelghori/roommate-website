'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';

const FacebookSVG = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramSVG = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);


const FOOTER_LINKS = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  explore: [
    { label: 'PG in Ahmedabad', href: '/explore?q=PG' },
    { label: 'Shared Flats', href: '/explore?q=Flat' },
    { label: 'Roommates', href: '/roommates' },
    { label: 'Post Property', href: '/listings/add' },
  ],
  popular_areas: [
    { label: 'Satellite', href: '/areas/satellite' },
    { label: 'Navrangpura', href: '/areas/navrangpura' },
    { label: 'Vastrapur', href: '/areas/vastrapur' },
    { label: 'Prahlad Nagar', href: '/areas/prahlad-nagar' },
    { label: 'Bodakdev', href: '/areas/bodakdev' },
  ],
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@roommat.in';
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '8866566752';
const SUPPORT_PHONE_DIGITS = SUPPORT_PHONE.replace(/\D/g, '');
const SUPPORT_PHONE_HREF = SUPPORT_PHONE_DIGITS.length === 10 ? `+91${SUPPORT_PHONE_DIGITS}` : SUPPORT_PHONE;

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-8 pb-8 lg:pt-10 lg:pb-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col gap-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Roommat Logo"
                width={240}
                height={80}
                className="h-10 w-auto object-contain"
                quality={100}
                unoptimized
                sizes="200px"
              />
            </Link>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Find verified PG rooms, shared flats, and ideal roommates in Ahmedabad & Gandhinagar.
              Making co-living simple, safe, and social.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                {
                  icon: FacebookSVG,
                  label: 'Facebook',
                  href: 'https://www.facebook.com/share/1E79f18HU7/?mibextid=wwXIfr',
                },
                {
                  icon: InstagramSVG,
                  label: 'Instagram',
                  href: 'https://www.instagram.com/roommatliving?igsh=MWRiMDN3YW9sNXZtbw==',
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>

          </div>

          {/* Links Columns */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Explore</h3>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-500 text-sm hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Popular Areas</h3>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.popular_areas.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-500 text-sm hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Company</h3>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-500 text-sm hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Contact + Copyright */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-2 text-gray-500 text-sm hover:text-primary transition-colors"
            >
              <Mail size={16} className="text-primary" />
              <span>{SUPPORT_EMAIL}</span>
            </a>
            <a
              href={`tel:${SUPPORT_PHONE_HREF}`}
              className="flex items-center gap-2 text-gray-500 text-sm hover:text-primary transition-colors"
            >
              <Phone size={16} className="text-primary" />
              <span>{SUPPORT_PHONE}</span>
            </a>
          </div>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Roommat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
