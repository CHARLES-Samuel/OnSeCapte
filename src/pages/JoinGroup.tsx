import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Users, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { groupService } from '../services/implementations/FirestoreGroupService';

/**
 * Page d'adhésion via lien d'invitation partageable.
 * URL attendue : /join/:inviteCode
 *
 * Comportements :
 * - Si l'utilisateur est connecté → tente de rejoindre directement le groupe (idempotent).
 * - Si non connecté → stocke l'intention dans sessionStorage et redirige vers la page d'accueil.
 * - Après connexion, Home redirige vers ce chemin et l'adhésion se finalise automatiquement.
 */
export const JoinGroup = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting_auth'>('loading');
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('');
  const [joinedGroupId, setJoinedGroupId] = useState<string | null>(null);

  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!inviteCode) {
      setStatus('error');
      setMessage("Lien d'invitation invalide.");
      return;
    }

    // Utilisateur non connecté : sauvegarder l'intention et afficher l'état d'attente
    if (!user) {
      sessionStorage.setItem('pendingInviteCode', inviteCode);
      sessionStorage.setItem('pendingInvitePath', location.pathname);
      setStatus('waiting_auth');
      setMessage("Vous devez vous connecter pour rejoindre ce groupe. Votre invitation sera conservée.");
      return;
    }

    // Utilisateur connecté : tenter de rejoindre
    const attemptJoin = async () => {
      try {
        setStatus('loading');
        const group = await groupService.joinGroup(user.uid, inviteCode);
        setGroupName(group.name);
        setJoinedGroupId(group.id);
        setStatus('success');

        // Nettoyer les clés de session
        sessionStorage.removeItem('pendingInviteCode');
        sessionStorage.removeItem('pendingInvitePath');

        // Redirection automatique vers le groupe après un court délai
        redirectTimerRef.current = setTimeout(() => {
          navigate(`/groups/${group.id}`);
        }, 1800);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : "Impossible de rejoindre le groupe.");
      }
    };

    attemptJoin();
  }, [authLoading, user, inviteCode, location.pathname, navigate]);

  const handleGoHome = () => navigate('/');
  const handleSignIn = () => navigate('/', { state: { openAuth: true } });
  const handleGoToGroup = () => {
    if (joinedGroupId) {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      navigate(`/groups/${joinedGroupId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-800/60 backdrop-blur-md p-8 text-center space-y-6 shadow-2xl">

        {/* Icône */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" aria-label="Chargement en cours" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" aria-hidden="true" />
            </div>
          )}
          {(status === 'error' || status === 'waiting_auth') && (
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              status === 'error'
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-amber-500/10 border border-amber-500/20'
            }`}>
              {status === 'error'
                ? <AlertTriangle className="w-8 h-8 text-red-400" aria-hidden="true" />
                : <Users className="w-8 h-8 text-amber-400" aria-hidden="true" />
              }
            </div>
          )}
        </div>

        {/* Contenu selon l'état */}
        {status === 'loading' && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Rejoindre le groupe…</h1>
            <p className="text-slate-400 text-sm">Vérification du lien d'invitation en cours.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Accès au groupe confirmé !</h1>
            <p className="text-slate-400 text-sm">
              Bienvenue dans <strong className="text-white">{groupName}</strong>. Redirection en cours…
            </p>
            {joinedGroupId && (
              <button
                onClick={handleGoToGroup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition shadow-lg shadow-primary-600/20"
              >
                <span>Accéder au groupe dès maintenant</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Impossible de rejoindre</h1>
            <p className="text-red-400 text-sm">{message}</p>
            <button
              onClick={handleGoHome}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
            >
              Retour à l'accueil
            </button>
          </div>
        )}

        {status === 'waiting_auth' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-white">Invitation en attente</h1>
            <p className="text-slate-400 text-sm">{message}</p>
            <button
              onClick={handleSignIn}
              className="w-full px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition shadow-lg shadow-primary-600/20"
            >
              Se connecter pour rejoindre
            </button>
          </div>
        )}

        {/* Code d'invitation affiché */}
        {inviteCode && (
          <p className="text-xs text-slate-500">
            Code d'invitation : <code className="font-mono text-slate-300">{inviteCode.toUpperCase()}</code>
          </p>
        )}
      </div>
    </div>
  );
};
