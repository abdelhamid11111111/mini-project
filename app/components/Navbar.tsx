'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const Navbar = () => {
  const pathname = usePathname()
  const Links = [
    {
      id: 1,
      href: "/",
      title: "Products",
    },
    {
      id: 2,
      href: "/categories",
      title: "Categories",
    },
  ];

   const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-white px-10 py-3 shadow-sm">
        <div className="flex flex-1 justify-center gap-6 items-center">
          <nav className="flex items-center gap-8">
            {Links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`hover:text-blue-600 text-sm font-medium leading-normal
                  ${isActive(link.href) ? 'text-blue-600' : 'text-gray-600'}`
                }
              >
                {link.title}
              </Link>
            ))}
            {/* <Link href='/categories'
              className="text-gray-600 hover:text-blue-600 text-sm font-medium leading-normal"
            >
              Categories
            </Link >
            <Link href='/' className="text-blue-600 text-sm font-bold leading-normal" >
              Products
            </Link > */}
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
