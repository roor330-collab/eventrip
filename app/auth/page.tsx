"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Ticket, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(redirectTo);
    });
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      }
    } catch (err: any) {
      const msg = err.message || "Une erreur est survenue.";
      if (msg.includes("Invalid login credentials")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("User already registered")) setError("Un compte existe déjà avec cet email.");
      else if (msg.includes("Email not confirmed")) setError("Veuillez confirmer votre email d'abord.");
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Eventrip</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "login" ? "Bon retour !" : "Créer un compte"}
          </h1>
          <p className="text-gray-500 mt-2">
            {mode === "login"
              ? "Connectez-vous pour accéder à vos packs"
              : "Rejoignez Eventrip pour réserver vos événements"}
          </p>
        </div>

        {/* Toggle */}
        <div className="bg-gray-100 rounded-xl p-1 flex mb-8">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "login" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "signup" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm password (signup only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
