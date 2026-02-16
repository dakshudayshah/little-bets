import { useTheme, type Theme } from '../context/ThemeContext';
import '../styles/ThemeToggle.css';

const themes: { key: Theme; icon: string; label: string }[] = [
  { key: 'default', icon: '○', label: 'Default' },
  { key: 'retro', icon: '◐', label: 'Retro' },
  { key: 'brutalist', icon: '■', label: 'Bold' },
  { key: 'dark', icon: '●', label: 'Dark' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle">
      {themes.map(t => (
        <button
          key={t.key}
          className={`theme-toggle-btn ${theme === t.key ? 'active' : ''}`}
          onClick={() => setTheme(t.key)}
          title={t.label}
        >
          <span className="theme-toggle-icon">{t.icon}</span>
          <span className="theme-toggle-label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ThemeToggle;
