import { useEffect } from "react";
import { Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Home = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#fonctionnalites') {
      const el = document.getElementById('fonctionnalites');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  // Si l'utilisateur est connecté, on l'envoie vers l'invitation en attente ou le dashboard
  if (user && !loading) {
    const pendingPath = sessionStorage.getItem('pendingInvitePath');
    if (pendingPath) {
      sessionStorage.removeItem('pendingInvitePath');
      return <Navigate to={pendingPath} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-3xl mx-auto space-y-10 sm:space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Organiser des sorties <br className="hidden md:block" />
              <span className="inline-block pb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary-400 to-indigo-400">
                n'a jamais été aussi simple
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Proposez des dates, votez pour vos disponibilités et retrouvez-vous sans les interminables boucles de messages.
            </p>
          </div>

          {/* Call to action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 sm:pt-4">
            <button 
              onClick={signInWithGoogle}
              className="group px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-3 w-full sm:w-auto justify-center cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#ffffff"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#ffffff"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#ffffff"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#ffffff"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Connexion avec Google</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>

          {/* Features Preview */}
          <div id="fonctionnalites" className="scroll-mt-24 grid md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-slate-800/50">
            <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors text-left group">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Groupes privés</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Invitez vos amis avec un simple code. Chaque groupe a son propre espace.</p>
            </div>
            <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors text-left group">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Vote des dates</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Fini les "je sais pas, comme vous voulez". Votez pour le meilleur créneau.</p>
            </div>
            <div className="p-6 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors text-left group">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lieu & Activité</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Centralisez toutes les infos au même endroit pour chaque sortie.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
