"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plane,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

const PERKS = [
  { icon: TrendingDown, text: "Predicción de precios con IA" },
  { icon: Shield, text: "Alertas cuando el precio baja" },
  { icon: Globe, text: "Acceso a vuelos en 195 países" },
  { icon: Sparkles, text: "Chatbot IA disponible 24/7" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("Error al conectar con Google. Inténtalo nuevamente.");
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: "demo@skyai.com",
        password: "skyai2026",
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas. Usa demo@skyai.com / skyai2026");
      } else {
        router.push("/");
      }
    } catch {
      setError("Error al iniciar sesión. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales incorrectas. Usa demo@skyai.com / skyai2026");
      } else {
        router.push("/");
      }
    } catch {
      setError("Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden items-center justify-center p-12">
        {/* Background effects */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200"
            alt="Airplane wing"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#040d21]" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(160deg, rgba(4,13,33,0.3), rgba(4,13,33,0.8))" }}
          />
        </div>

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plane size={20} className="text-white" />
            </div>
            <span
              className="text-2xl font-bold gradient-text"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              SkyAI
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1
              className="text-4xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Viaja más inteligente
              <br />
              <span className="gradient-text">con IA</span>
            </h1>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Únete a millones de viajeros que ya ahorran hasta un 40% en sus vuelos gracias a nuestra predicción de precios con inteligencia artificial.
            </p>
          </motion.div>

          <div className="space-y-4">
            {PERKS.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-blue-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Plane size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              SkyAI
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Iniciar sesión
            </h2>
            <p className="text-slate-400 text-sm">Accede a tu cuenta para continuar</p>
          </div>

          {/* Google OAuth */}
          <button
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="btn-google mb-4"
          >
            {googleLoading ? (
              <div className="spinner" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continuar con Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-500/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-slate-500" style={{ background: "var(--background)" }}>
                o con email
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@skyai.com"
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="skyai2026"
                  className="input-field pl-9"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? <div className="spinner" /> : (
                <>Iniciar Sesión <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo account */}
          <div className="mt-4 p-3 rounded-xl glass border border-blue-500/10">
            <p className="text-xs text-slate-400 mb-2 text-center">Cuenta de demo para pruebas</p>
            <div className="flex gap-2 text-xs text-slate-300 justify-center mb-2">
              <span>demo@skyai.com</span>
              <span className="text-slate-500">/</span>
              <span>skyai2026</span>
            </div>
            <button
              id="demo-login-btn"
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn-secondary w-full text-sm py-2"
            >
              <Sparkles size={14} />
              Entrar con cuenta demo
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Al iniciar sesión, aceptas nuestros{" "}
            <a href="#" className="text-blue-400 hover:text-cyan-400 transition-colors">Términos de Servicio</a>{" "}
            y{" "}
            <a href="#" className="text-blue-400 hover:text-cyan-400 transition-colors">Política de Privacidad</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
