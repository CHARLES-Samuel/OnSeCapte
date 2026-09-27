import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Users, LogOut, Edit2, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { EditPseudoModal } from "../features/auth/EditPseudoModal";

export const Navbar = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditPseudoModalOpen, setIsEditPseudoModalOpen] = useState(false);

  return (
    <>
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate(user ? "/dashboard" : "/")}
        >
          {user ? (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center rotate-3 shadow-lg group-hover:scale-105 transition-transform">
              <Users className="text-white w-4 h-4 -rotate-3" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="text-white w-5 h-5 -rotate-3" />
            </div>
          )}
          
          <h1 className={`font-bold tracking-tight text-white ${user ? 'text-lg' : 'text-xl'}`}>
            On<span className="text-primary-500">SeCapte</span>
          </h1>
        </div>

        <nav className="flex items-center gap-4">
          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-slate-700 hidden sm:block" 
                />
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">
                  {user.displayName || "User"}
                </span>
                <button 
                  onClick={() => setIsEditPseudoModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  title="Modifier le pseudo"
                  aria-label="Modifier le pseudo"
                >
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="w-px h-5 bg-slate-800 mx-1 hidden sm:block"></div>
              <button 
                onClick={signOut}
                className="p-2 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                title="Déconnexion"
                aria-label="Se déconnecter"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="px-5 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300"
            >
              Connexion avec Google
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
