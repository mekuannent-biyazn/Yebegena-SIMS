import { create } from 'zustand'

export const useThemeStore = create((set) => {
  // Get theme from localStorage or default to light
  const storedTheme = localStorage.getItem('theme') || 'light'
  const isDark = storedTheme === 'dark'
  
  // Apply theme to document on init
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  return {
    isDark,
    
    toggleTheme: () => {
      set((state) => {
        const newIsDark = !state.isDark
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
        
        if (newIsDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        return { isDark: newIsDark }
      })
    },
  }
})
