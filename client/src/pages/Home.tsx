import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle, Mail } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

/**
 * Design Philosophy: Match exact reference design
 * - Dark navy/purple background with Indonesia map
 * - Gradient colors: pink → purple → blue → cyan/teal
 * - Logo and map as key visual elements
 * - All sections accessible via top menu
 */

type Section = "hero" | "about" | "guest" | "judges" | "mentor" | "timeline" | "peserta" | "voter";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  const { user, loading, error, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "about", label: "About" },
    { id: "guest", label: "Guest & Host" },
    { id: "judges", label: "Juri" },
    { id: "mentor", label: "Mentor" },
    { id: "timeline", label: "Timeline" },
    { id: "peserta", label: "Peserta" },
    { id: "voter", label: "Voter" },
  ];

  const handleMenuClick = (section: Section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center bg-slate-900/60 backdrop-blur-sm border-b border-cyan-400/20">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src="/images/logo.png" alt="MWB Logo" className="h-14 sm:h-16 md:h-14 w-auto" />
          <div>
            <p className="text-cyan-400 font-mono font-bold text-xs sm:text-sm leading-tight">MOVEMENT</p>
            <p className="text-cyan-400 font-mono font-bold text-xs sm:text-sm leading-tight">WITH BENEFIT</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id as Section)}
              className="text-slate-300 hover:text-cyan-400 transition-colors duration-200 font-mono text-sm font-semibold relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex gap-3">
          <Button
            variant="outline"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-mono font-bold text-sm"
          >
            🗳️ Vote Sekarang
          </Button>
          <Button onClick={() => setLocation("/register")} className="bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-mono font-bold text-sm hover:shadow-lg hover:shadow-pink-500/50">
            ▶ Daftar Sekarang
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-slate-700 rounded transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-slate-800 border-b border-cyan-400/20 md:hidden z-40">
          <div className="flex flex-col p-4 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id as Section)}
                className="px-4 py-3 text-left font-mono font-semibold text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 rounded transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 border-cyan-400 text-cyan-400 text-xs">
                Vote
              </Button>
              <Button onClick={() => setLocation("/register")} className="flex-1 bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-bold text-xs">
                Daftar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {activeSection === "hero" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Background Map */}
          <div className="absolute inset-0 opacity-30 sm:opacity-40 flex items-center justify-center">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-contain object-center"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-6 py-20 pb-32 sm:pb-20 flex flex-col items-center justify-center text-center">
            {/* Logo */}
            <div className="mb-6 sm:mb-10 md:mb-12">
              <img src="/images/logo.png" alt="Movement with Benefit" className="h-32 sm:h-40 md:h-48 mx-auto" />
            </div>

            {/* Main Title */}
            <div className="space-y-3 sm:space-y-5 max-w-4xl">
              <h1 className="font-mono font-black text-4xl sm:text-6xl md:text-7xl leading-tight">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  MOVEMENT WITH
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  BENEFIT
                </span>
              </h1>

              <p className="text-xl sm:text-3xl md:text-3xl text-white font-mono font-bold">AUDISI</p>

              <p className="text-sm sm:text-lg md:text-2xl text-slate-300 font-mono tracking-wider">
                ACTING | VOCAL | MODEL
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Movement with Benefit adalah sebuah audisi bakat nasional yang mencari talenta terbaik di bidang acting, vocal, dan modeling dari seluruh 38 provinsi di Indonesia.
              </p>

              <p className="text-xs sm:text-sm md:text-base text-slate-400 px-2">
                Diselenggarakan oleh <span className="text-cyan-400 font-bold">PT. Pandawa Kreasi Organizer</span> dengan tema{" "}
                <span className="text-cyan-400 font-bold">"Discover Your Talent, Inspire the Nation"</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-10 px-2">
              <Button onClick={() => setLocation("/register")} className="bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-mono font-bold text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 w-full sm:w-auto">
                ▶ Daftar Sekarang
              </Button>
              <Button
                variant="outline"
                className="border-2 border-cyan-400 text-cyan-400 font-mono font-bold text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 hover:bg-cyan-400/10 transition-all duration-300 w-full sm:w-auto"
              >
                🗳️ Vote Sekarang
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6 sm:mt-10 justify-center text-xs sm:text-sm px-2">
              <a
                href="https://wa.me/6282315660007"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <MessageCircle size={18} />
                <span className="font-mono text-xs sm:text-sm">📱 WhatsApp</span>
              </a>
              <a
                href="mailto:movementwithbenefit@gmail.com"
                className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Mail size={18} />
                <span className="font-mono text-xs sm:text-sm">Email</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-6 mt-8">
              <a
                href="https://www.tiktok.com/@movementwithbenefit?_r=1&_t=ZS-917gEPwrQ1K"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-pink-500 transition-colors"
              >
                <span className="font-mono text-sm">TikTok</span>
              </a>
              <a
                href="https://www.instagram.com/movementwithbenefit?igsh=YzRzbmk3cDdzejZs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-pink-500 transition-colors"
              >
                <span className="font-mono text-sm">Instagram</span>
              </a>
              <a
                href="https://youtube.com/@movementwithbenefit1?si=qcbhUcmMytJYYdM0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-pink-500 transition-colors"
              >
                <span className="font-mono text-sm">YouTube</span>
              </a>
            </div>
          </div>

          {/* Floating DAFTAR Button (Bottom Right) - Hidden on mobile, shown on desktop */}
          <div className="hidden sm:block fixed bottom-8 right-8 z-40">
            <button onClick={() => setLocation("/register")} className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-mono font-bold text-sm text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
              DAFTAR
            </button>
          </div>
        </section>
      )}

      {/* About Section */}
      {activeSection === "about" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 space-y-8">
            <h2 className="font-mono font-black text-5xl md:text-6xl text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                TENTANG KAMI
              </span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-6 text-slate-300">
              <p className="text-lg leading-relaxed">
                <span className="text-cyan-400 font-bold">Movement with Benefit</span> adalah sebuah audisi bakat nasional yang mencari talenta terbaik di bidang acting, vocal, dan modeling dari seluruh 38 provinsi di Indonesia.
              </p>
              <p className="text-lg leading-relaxed">
                Diselenggarakan oleh <span className="text-cyan-400 font-bold">PT. Pandawa Kreasi Organizer</span> dengan tema <span className="text-cyan-400 font-bold">"Discover Your Talent, Inspire the Nation"</span>, audisi ini memberikan kesempatan emas bagi setiap individu untuk menunjukkan kemampuan mereka di panggung nasional.
              </p>
              <p className="text-lg leading-relaxed">
                Pemenang akan mendapatkan kontrak dengan partner label rekaman dan production house profesional, membuka peluang karir yang luar biasa di industri entertainment.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Guest & Host Section */}
      {activeSection === "guest" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 space-y-12">
            <h2 className="font-mono font-black text-5xl md:text-6xl text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                GUEST STAR & HOST
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎬</div>
                <h3 className="text-2xl font-mono font-bold text-cyan-400">GUEST STAR</h3>
                <p className="text-slate-300">Coming Soon</p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-6xl">🎤</div>
                <h3 className="text-2xl font-mono font-bold text-cyan-400">HOST UTAMA</h3>
                <p className="text-slate-300">Profesional industri entertainment yang akan membimbing dan menilai peserta</p>
                <p className="text-slate-400 text-sm">Coming Soon</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Judges Section */}
      {activeSection === "judges" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 space-y-12">
            <h2 className="font-mono font-black text-5xl md:text-6xl text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                JURI
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {["Acting", "Vocal", "Model"].map((category) => (
                <div key={category} className="text-center space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-mono font-bold text-cyan-400">Juri Utama</h3>
                    <p className="text-slate-300">{category}</p>
                    <p className="text-slate-400 text-sm">Coming Soon</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mentor Section */}
      {activeSection === "mentor" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 space-y-12">
            <h2 className="font-mono font-black text-5xl md:text-6xl text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                MENTOR
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {["Acting", "Vocal", "Model"].map((category) => (
                <div key={category} className="text-center space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-mono font-bold text-cyan-400">Mentor</h3>
                    <p className="text-slate-300">{category}</p>
                    <p className="text-slate-400 text-sm">Coming Soon</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {activeSection === "timeline" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 space-y-12">
            <h2 className="font-mono font-black text-5xl md:text-6xl text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                TIMELINE
              </span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-8">
              {[
                { num: 1, title: "Pendaftaran Online", date: "Okt - Nov 2025", desc: "Buka pendaftaran untuk seluruh kategori" },
                { num: 2, title: "Audisi Regional", date: "Des 2025 - Jan 2026", desc: "Seleksi di 38 provinsi" },
                { num: 3, title: "Semi Final", date: "Feb 2026 - Jakarta", desc: "Peserta terbaik dari regional" },
                { num: 4, title: "Grand Final", date: "07 Feb 2026 - Jakarta", desc: "Penentuan pemenang dan malam penghargaan" },
              ].map((item) => (
                <div key={item.num} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-mono font-bold">
                      {item.num}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-mono font-bold text-cyan-400">{item.title}</h3>
                    <p className="text-slate-300 font-mono text-sm">{item.date}</p>
                    <p className="text-slate-400 mt-2">{item.desc}</p>
                  </div>
                </div>
              ))}
              <div className="mt-8 p-6 border border-cyan-400/30 rounded-lg bg-slate-800/30">
                <p className="text-slate-300 text-center">
                  Pemenang akan mendapatkan <span className="text-cyan-400 font-bold">kontrak dengan partner label rekaman dan production house profesional</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Peserta Section */}
      {activeSection === "peserta" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 space-y-12">
            <h2 className="font-mono font-black text-5xl md:text-6xl text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                PESERTA
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🎭", title: "Acting", desc: "Tunjukkan kemampuan akting Anda" },
                { icon: "🎤", title: "Vocal", desc: "Nyanyikan lagu favorit Anda" },
                { icon: "📸", title: "Model", desc: "Tampilkan penampilan terbaik Anda" },
              ].map((category) => (
                <div
                  key={category.title}
                  className="p-6 border border-cyan-400/30 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-center space-y-4"
                >
                  <div className="text-5xl">{category.icon}</div>
                  <h3 className="text-2xl font-mono font-bold text-cyan-400">{category.title}</h3>
                  <p className="text-slate-300">{category.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center pt-8">
              <Button onClick={() => setLocation("/register")} className="bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-mono font-bold text-lg px-8 py-6">
                ▶ Daftar Sekarang
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Voter Section */}
      {activeSection === "voter" && (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
          <div className="absolute inset-0 opacity-20">
            <img
              src="/images/map-indonesia.png"
              alt="Indonesia Map"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 container mx-auto px-6 space-y-12">
            <h2 className="font-mono font-black text-5xl md:text-6xl text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                VOTER
              </span>
            </h2>
            <div className="max-w-2xl mx-auto space-y-6 text-center">
              <p className="text-lg text-slate-300">
                Jadilah bagian dari gerakan ini! Dukung talenta favorit Anda dan bantu mereka mencapai impian mereka.
              </p>
              <p className="text-slate-400">
                Voting akan dibuka pada fase Grand Final. Setiap suara Anda sangat berarti untuk menentukan pemenang.
              </p>
              <Button className="bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-mono font-bold text-lg px-8 py-6">
                🗳️ Vote Sekarang
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Floating DAFTAR Button */}
      <button
        onClick={() => setLocation("/register")}
        className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white font-mono font-bold text-sm flex items-center justify-center hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 z-40"
        title="Daftar Sekarang"
      >
        DAFTAR
      </button>
    </div>
  );
}
