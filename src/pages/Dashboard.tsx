import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plus, Users, Loader2, ArrowRight, Copy, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useGroups } from "../hooks/useGroups";
import { CreateGroupModal } from "../components/features/groups/CreateGroupModal";
import { JoinGroupModal } from "../components/features/groups/JoinGroupModal";
import { MarkdownView } from "../components/ui/MarkdownView";

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { groups, loading: groupsLoading, createGroup, joinGroup } = useGroups(user?.uid);
  const navigate = useNavigate();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 font-sans min-h-full">

      <main className="max-w-5xl mx-auto p-4 sm:p-6 pt-6 sm:pt-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">Bonjour, {user.displayName?.split(" ")[0]} ! 👋</h2>
            <p className="text-slate-400 text-sm sm:text-base">Gérez vos groupes et organisez vos prochaines sorties.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => setIsJoinModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700 min-h-[42px]"
            >
              Rejoindre
            </button>
            <button 
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 min-h-[42px]"
            >
              <Plus className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Nouveau Groupe</span>
            </button>
          </div>
        </div>

        {groupsLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 px-6 bg-slate-800/30 border border-slate-800 rounded-2xl border-dashed">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Vous n'avez aucun groupe</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              Créez votre premier groupe pour inviter vos amis, ou rejoignez un groupe existant avec un code d'invitation.
            </p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-full transition-colors inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
            >
              Créer mon premier groupe
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div 
                key={group.id} 
                onClick={() => navigate(`/groups/${group.id}`)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-primary-500/50 hover:bg-slate-800 transition-all group flex flex-col cursor-pointer overflow-hidden"
              >
                {/* Bannière */}
                {group.bannerUrl ? (
                  <div className="h-24 w-full bg-slate-700 relative">
                    <img src={group.bannerUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-12 w-full bg-gradient-to-r from-slate-800 to-slate-800/50"></div>
                )}
                
                <div className="p-6 pt-0 flex-1 flex flex-col">
                  <div className="flex justify-between items-end mb-4 -mt-8 relative z-10">
                    {group.photoUrl ? (
                      <img src={group.photoUrl} alt={`Photo de ${group.name}`} className="w-16 h-16 rounded-xl object-cover shrink-0 border-4 border-slate-900 shadow-xl bg-slate-800" />
                    ) : (
                      <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border-4 border-slate-900 shadow-xl">
                        <Users className="w-7 h-7 text-slate-400" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-700 shadow-sm mb-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-300">{group.members.length}</span>
                    </div>
                  </div>
                <h3 className="text-lg font-bold text-white mb-2 truncate">{group.name}</h3>
                <div className="mb-6 flex-1 line-clamp-2">
                  <MarkdownView content={group.description || "Aucune description"} className="text-slate-400 !text-sm !space-y-0" />
                </div>
                
                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center mt-auto">
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                    Code: 
                    <span className="font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded tracking-widest uppercase relative group-hover:text-primary-400 transition-colors">
                      {group.inviteCode}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(group.inviteCode);
                        }}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        title="Copier le code"
                        aria-label="Copier le code d'invitation"
                      >
                        {copiedCode === group.inviteCode ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </span>
                  </div>
                  <button 
                    type="button"
                    aria-label={`Accéder au groupe ${group.name}`}
                    className="text-primary-400 hover:text-primary-300 p-2 rounded-lg hover:bg-primary-500/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 -mr-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createGroup}
      />
      <JoinGroupModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={joinGroup}
      />
    </div>
  );
};
