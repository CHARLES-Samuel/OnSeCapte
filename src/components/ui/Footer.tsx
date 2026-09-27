import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} OnSeCapte. Tous droits réservés.
          </div>
          <nav aria-label="Liens légaux">
            <ul className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <li>
                <Link to="/mentions-legales" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1 py-0.5">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1 py-0.5">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1 py-0.5">
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};
