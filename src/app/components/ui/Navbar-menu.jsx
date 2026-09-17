"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Menu:
 * - hover moves indicator
 * - mouse leave restores active route indicator
 */
export const Menu = ({ children }) => {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState(null);
  const pathname = usePathname();

  const moveIndicatorToEl = (el) => {
    if (!el || !navRef.current) return;

    const itemRect = el.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();

    setIndicator({
      width: itemRect.width,
      left: itemRect.left - navRect.left,
    });
  };

  //  Move indicator to active route
  const moveToActiveRoute = () => {
    const activeEl = navRef.current?.querySelector(
      `[data-active="true"]`
    );
    moveIndicatorToEl(activeEl);
  };

  // On route change → sync indicator
  useEffect(() => {
    moveToActiveRoute();
  }, [pathname]);

  return (
    <div
      ref={navRef}
      onMouseLeave={moveToActiveRoute} 
      className="relative flex items-center gap-6"
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onHover: moveIndicatorToEl,
        })
      )}

      {indicator && (
        <motion.div
          className="absolute -bottom-2 h-[2px] rounded-full bg-purple-500"
          animate={{
            width: indicator.width,
            x: indicator.left,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        />
      )}
    </div>
  );
};

/**
 * MenuItem:
 * - reports hover
 * - exposes active state
 */
export const MenuItem = ({ href, children, onHover }) => {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);
  
  return (
    <Link href={href}>
      <span
        data-active={isActive ? "true" : "false"}
        onMouseEnter={(e) => onHover && onHover(e.currentTarget)}
        className="cursor-pointer font-medium text-black dark:text-white text-sm lg:text-base whitespace-nowrap"
      >
        {children}
      </span>
    </Link>
  );
};
