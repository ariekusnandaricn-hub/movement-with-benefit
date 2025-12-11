import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

/**
 * Design Philosophy: Neo-Brutalism with Neon Accents
 * - Charcoal/navy background with neon pink, cyan, and yellow accents
 * - Bold monospace typography for display
 * - Asymmetric layout with diagonal cuts
 * - Only hero section visible initially, other sections via menu
 */

type Section = "hero" | "about" | "guest" | "judges" | "timeline" | "peserta" | "voter";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "about", label: "About" },
    { id: "guest", label: "Guest & Host" },
    { id: "judges", label: "Judges" },
    { id: "timeline", label: "Timeline" },
    { id: "peserta", label: "Peserta" },
    { id: "voter", label: "Voter" },
  ];

  const handleMenuClick = (section: Section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-sm border-b border-neon-pink/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-pink to-neon-cyan rounded-sm flex items-center justify-center">
            <span className="font-bold text-xs">MWB</span>
          </div>
          <span className="font-mono font-bold text-lg bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
            MOVEMENT
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id as Section)}
              className="px-4 py-2 text-sm font-mono font-semibold text-slate-300 hover:text-neon-pink transition-colors duration-200 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-pink to-neon-cyan group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex gap-3">
          <Button
            variant="outline"
            className="border-neon-pink text-neon-pink hover:bg-neon-pink/10 font-mono font-bold"
          >
            ▶ Daftar
          </Button>
          <Button className="bg-gradient-to-r from-neon-pink to-neon-cyan text-slate-950 font-mono font-bold hover:shadow-lg hover:shadow-neon-pink/50">
            🗳️ Vote
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-slate-800 rounded transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-slate-900 border-b border-neon-pink/20 md:hidden z-40">
          <div className="flex flex-col p-4 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id as Section)}
                className="px-4 py-3 text-left font-mono font-semibold text-slate-300 hover:text-neon-pink hover:bg-slate-800/50 rounded transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 border-neon-pink text-neon-pink">
                Daftar
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-neon-pink to-neon-cyan text-slate-950 font-bold">
                Vote
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {activeSection === "hero" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated gradient orbs */}
            <div className="absolute top-20 -left-40 w-80 h-80 bg-neon-pink/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 -right-40 w-80 h-80 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-neon-yellow/10 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-6 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="font-mono font-black text-5xl md:text-7xl leading-tight">
                    <span className="bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-cyan bg-clip-text text-transparent">
                      MOVEMENT
                    </span>
                    <br />
                    <span className="text-slate-300">WITH</span>
                    <br />
                    <span className="bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
                      BENEFIT
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-400 font-mono">AUDISI NASIONAL</p>
                </div>

                <div className="space-y-3 text-slate-300">
                  <p className="text-lg">Kategori: <span className="text-neon-pink font-bold">ACTING | VOCAL | MODEL</span></p>
                  <p className="text-base leading-relaxed">
                    Cari talenta terbaik dari 38 provinsi di Indonesia. Tema: <span className="text-neon-cyan font-bold">"Discover Your Talent, Inspire the Nation"</span>
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button className="bg-gradient-to-r from-neon-pink to-neon-yellow text-slate-950 font-mono font-bold text-lg px-8 py-6 hover:shadow-lg hover:shadow-neon-pink/50 transition-all duration-300">
                    ▶ Daftar Sekarang
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-neon-cyan text-neon-cyan font-mono font-bold text-lg px-8 py-6 hover:bg-neon-cyan/10 transition-all duration-300"
                  >
                    🗳️ Vote Sekarang
                  </Button>
                </div>

                {/* Timeline Info */}
                <div className="pt-6 border-t border-neon-pink/30 space-y-2">
                  <p className="text-sm text-slate-400 font-mono">TIMELINE</p>
                  <p className="text-slate-300"><span className="text-neon-yellow">Regional:</span> Des 2025 - Jan 2026</p>
                  <p className="text-slate-300"><span className="text-neon-cyan">Grand Final:</span> 07 Feb 2026 - Jakarta</p>
                </div>
              </div>

              {/* Right Visual */}
              <div className="relative hidden lg:block">
                <div className="relative w-full aspect-square">
                  {/* Geometric shapes */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Large circle with gradient border */}
                      <div className="absolute inset-0 rounded-full border-2 border-neon-pink/50 animate-spin" style={{ animationDuration: "20s" }} />
                      <div className="absolute inset-8 rounded-full border-2 border-neon-cyan/50 animate-spin" style={{ animationDuration: "30s", animationDirection: "reverse" }} />
                      <div className="absolute inset-16 rounded-full border-2 border-neon-yellow/30 animate-pulse" />

                      {/* Center content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="text-6xl font-mono font-black bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                            38
                          </div>
                          <p className="text-slate-400 font-mono text-sm">PROVINSI</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="text-center">
              <p className="text-xs text-slate-500 font-mono mb-2">SCROLL OR SELECT MENU</p>
              <div className="w-6 h-10 border-2 border-neon-pink/50 rounded-full flex justify-center p-2">
                <div className="w-1 h-2 bg-neon-pink rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Sections - Placeholder */}
      {activeSection !== "hero" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <div className="container mx-auto px-6 text-center space-y-6">
            <h2 className="font-mono font-black text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                {menuItems.find((item) => item.id === activeSection)?.label || "SECTION"}
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Coming soon...</p>
            <Button
              onClick={() => handleMenuClick("hero")}
              className="bg-gradient-to-r from-neon-pink to-neon-cyan text-slate-950 font-mono font-bold"
            >
              ← Back to Hero
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
