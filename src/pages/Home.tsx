import { Calendar, Users, MapPin, ArrowRight } from "lucide-react";
import { app } from "../config/firebase";

export const Home = () => {
  // Simple verification that Firebase is initialized
  const isFirebaseInitialized = !!app;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-primary-500/20">
            <Calendar className="text-white w-5 h-5 -rotate-3" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            On<span className="text-primary-500">SeCapte</span>
          </h1>
        </div>
        <nav>
          <button className="px-5 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300">
            Connexion
          </button>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Organiser des sorties <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">
                n'a jamais été aussi simple
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Proposez des dates, votez pour vos disponibilités et retrouvez-vous sans les interminables boucles de messages.
            </p>
          </div>

          {/* Call to action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button className="group px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-semibold transition-all duration-300 shadow-lg shadow-primary-600/30 flex items-center gap-2 w-full sm:w-auto justify-center">
              Créer un groupe
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-all duration-300 border border-slate-700 w-full sm:w-auto justify-center">
              Rejoindre un groupe
            </button>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 pt-16 border-t border-slate-800/50">
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

          {/* Firebase Status */}
          <div className="pt-10">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border ${isFirebaseInitialized ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              <span className={`w-2 h-2 rounded-full ${isFirebaseInitialized ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
              {isFirebaseInitialized ? 'Firebase Initialisé & Connecté' : 'Erreur Initialisation Firebase'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
