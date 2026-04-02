import { useThemeStore } from '../../stores/themeStore'
import './ThemeToggle.css'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      className={`theme-toggle ${theme === 'dark' ? 'theme-sun' : 'theme-moon'}`}
      onClick={toggleTheme}
      aria-label={`Basculer vers le mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
      title={`Mode ${theme === 'dark' ? 'sombre' : 'clair'}`}
    >
      <span className="theme-icon-effect" />
      <span className="theme-label">
        {theme === 'dark' ? 'Clair' : 'Sombre'}
      </span>
    </button>
  )
}

