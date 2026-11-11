import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { translate, useAppLanguage } from '../utils/appLanguage.js';

const LANGUAGES = [
  { code: 'VI', label: 'Tiếng Việt' },
  { code: 'CN', label: '中文' },
  { code: 'EN', label: 'English' }
];

export default function SiteHeader({ localeCode, onLanguageChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const language = useAppLanguage();
  const navItems = [
    { path: '/', label: translate(language, 'home') },
    { path: '/myflashcard', label: translate(language, 'flashcards') },
    { path: '/typegame', label: translate(language, 'typingGame') },
    { path: '/multiplechoicegame', label: translate(language, 'multipleChoice') },
    { path: '/cv-online', label: translate(language, 'cvOnline') }
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const localizedPath = (path) => `${path === '/' ? '' : path}/${localeCode}`;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__top">
          <Link className="site-header__brand" to={localizedPath('/')}>
            <img src="/logo/vbt-1.png" alt="VBT" />
            <span>VBT Website</span>
          </Link>

          <button
            type="button"
            className="site-header__menu-button"
            aria-label={translate(language, isMenuOpen ? 'closeMenu' : 'openMenu')}
            aria-expanded={isMenuOpen}
            aria-controls="site-header-menu"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div
          id="site-header-menu"
          className={`site-header__menu${isMenuOpen ? ' site-header__menu--open' : ''}`}
        >
          <nav className="site-header__nav" aria-label="Điều hướng chính">
            {navItems.map((item) => (
              <Link key={item.path} to={localizedPath(item.path)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <label className="site-header__language">
            <select
              value={localeCode}
              onChange={(event) => {
                onLanguageChange(event.target.value);
                event.currentTarget.blur();
              }}
              aria-label={translate(language, 'selectLanguage')}
            >
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.code} — {language.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
