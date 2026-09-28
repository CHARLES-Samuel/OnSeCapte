import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, LogOut, Edit2, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { EditPseudoModal } from "../features/auth/EditPseudoModal";

export const Navbar = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditPseudoModalOpen, setIsEditPseudoModalOpen] = useState(false);

  return (
    <>
      <header className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate(user ? "/dashboard" : "/")}
        >
          {user ? (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center rotate-3 shadow-lg group-hover:scale-105 transition-transform">
              <Users className="text-white w-4 h-4 -rotate-3" />
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="text-white w-5 h-5 -rotate-3" />
            </div>
          )}
          
          <h1 className={`font-bold tracking-tight text-white ${user ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
            On<span className="text-primary-500">SeCapte</span>
          </h1>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4">
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-slate-700 hidden sm:block shrink-0" 
                />
              )}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-300 max-w-[100px] sm:max-w-[160px] truncate">
                  {user.displayName || "User"}
                </span>
                <button 
                  onClick={() => setIsEditPseudoModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-w-[32px] min-h-[32px] flex items-center justify-center"
                  title="Modifier le pseudo"
                  aria-label="Modifier le pseudo"
                >
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="w-px h-5 bg-slate-800 mx-1 hidden sm:block"></div>
              <button 
                onClick={signOut}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Déconnexion"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 hover:border-slate-600 rounded-xl shadow-sm hover:shadow-md backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[38px]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="hidden sm:inline">Connexion avec Google</span>
              <span className="sm:hidden">Connexion</span>
            </button>
          )}
        </nav>
      </header>

      <EditPseudoModal
        isOpen={isEditPseudoModalOpen}
        onClose={() => setIsEditPseudoModalOpen(false)}
      />
    </>
  );
};
