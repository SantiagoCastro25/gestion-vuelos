"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Plane,
  Hotel,
  Package,
  Bell,
  Globe,
  DollarSign,
  ChevronDown,
  User,
  LogOut,
  Heart,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCurrencyStore } from "@/store/useCurrencyStore";

const CURRENCIES = ["USD", "EUR", "COP", "MXN", "BRL", "GBP", "ARS", "CLP"];
const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { currency, setCurrency, fetchRates } = useCurrencyStore();
  const [language, setLanguage] = useState("es");
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    fetchRates(); // Fetch rates on load
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchRates]);

  const navLinks = [
    { href: "/", label: "Vuelos", icon: Plane },
    { href: "/hotels", label: "Hoteles", icon: Hotel },
    { href: "/packages", label: "Paquetes", icon: Package },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-bright shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Plane size={16} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles size={6} className="text-white" />
              </div>
            </div>
            <span
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              className="text-xl font-bold gradient-text"
            >
              SkyAI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === href
                    ? "bg-blue-500/15 text-cyan-400 border border-blue-500/25"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative hidden md:block">
              <button
                id="lang-selector"
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowCurrencyMenu(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Globe size={15} />
                <span>{LANGUAGES.find((l) => l.code === language)?.flag}</span>
                <ChevronDown size={12} />
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-40 glass-bright rounded-xl border border-blue-500/20 shadow-xl overflow-hidden"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                          language === lang.code
                            ? "text-cyan-400 bg-blue-500/10"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Selector */}
            <div className="relative hidden md:block">
              <button
                id="currency-selector"
                onClick={() => {
                  setShowCurrencyMenu(!showCurrencyMenu);
                  setShowLangMenu(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <DollarSign size={15} />
                <span>{currency}</span>
                <ChevronDown size={12} />
              </button>
              <AnimatePresence>
                {showCurrencyMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-36 glass-bright rounded-xl border border-blue-500/20 shadow-xl overflow-hidden"
                  >
                    {CURRENCIES.map((cur) => (
                      <button
                        key={cur}
                        onClick={() => {
                          setCurrency(cur);
                          setShowCurrencyMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                          currency === cur
                            ? "text-cyan-400 bg-blue-500/10"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification bell (logged in) */}
            {session && (
              <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
            )}

            {/* User menu / Login */}
            {session ? (
              <div className="relative">
                <button
                  id="user-menu"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowLangMenu(false);
                    setShowCurrencyMenu(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full glass-bright border border-blue-500/20 hover:border-blue-500/40 transition-all"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? ""}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    </div>
                  )}
                  <ChevronDown size={12} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-52 glass-bright rounded-xl border border-blue-500/20 shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-blue-500/10">
                        <p className="text-sm font-medium text-white">{session.user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={15} /> Mi Perfil
                      </Link>
                      <Link
                        href="/my-trips"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart size={15} /> Mis Viajes
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} /> Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm px-4 py-2">
                <User size={15} />
                Iniciar Sesión
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-bright border-t border-blue-500/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === href
                      ? "bg-blue-500/15 text-cyan-400"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
