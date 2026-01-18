import { createContext, useContext, ReactNode } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';

// Basic translations - can be expanded
const translations: Record<string, Record<string, string>> = {
  en: {
    settings: 'Settings',
    account: 'Account',
    email: 'Email',
    username: 'Username',
    password: 'Password',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    update: 'Update',
    signOut: 'Sign Out',
    audio: 'Audio',
    soundEffects: 'Sound Effects',
    ambientAudio: 'Ambient Water Sounds',
    volume: 'Volume',
    theme: 'Theme',
    softerTheme: 'Softer (Water)',
    hackerTheme: 'Hacker (Matrix)',
    animations: 'Animations',
    animationIntensity: 'Animation Intensity',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    language: 'Language',
    support: 'Support',
    contactUs: 'Contact Us',
    rememberMe: 'Remember me',
    staySignedIn: 'Stay signed in',
    goals: 'Goals',
    schedule: 'Schedule',
    progress: 'Progress',
    discipline: 'Discipline',
    leaderboard: 'Leaderboard',
    aiCoach: 'AI Coach',
  },
  es: {
    settings: 'Configuración',
    account: 'Cuenta',
    email: 'Correo electrónico',
    username: 'Nombre de usuario',
    password: 'Contraseña',
    changePassword: 'Cambiar contraseña',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar contraseña',
    update: 'Actualizar',
    signOut: 'Cerrar sesión',
    audio: 'Audio',
    soundEffects: 'Efectos de sonido',
    ambientAudio: 'Sonidos ambientales de agua',
    volume: 'Volumen',
    theme: 'Tema',
    softerTheme: 'Suave (Agua)',
    hackerTheme: 'Hacker (Matrix)',
    animations: 'Animaciones',
    animationIntensity: 'Intensidad de animación',
    notifications: 'Notificaciones',
    pushNotifications: 'Notificaciones push',
    language: 'Idioma',
    support: 'Soporte',
    contactUs: 'Contáctanos',
    rememberMe: 'Recuérdame',
    staySignedIn: 'Mantener sesión iniciada',
    goals: 'Metas',
    schedule: 'Horario',
    progress: 'Progreso',
    discipline: 'Disciplina',
    leaderboard: 'Tabla de líderes',
    aiCoach: 'Entrenador IA',
  },
  fr: {
    settings: 'Paramètres',
    account: 'Compte',
    email: 'E-mail',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    changePassword: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    update: 'Mettre à jour',
    signOut: 'Déconnexion',
    audio: 'Audio',
    soundEffects: 'Effets sonores',
    ambientAudio: "Sons d'eau ambiants",
    volume: 'Volume',
    theme: 'Thème',
    softerTheme: 'Doux (Eau)',
    hackerTheme: 'Hacker (Matrix)',
    animations: 'Animations',
    animationIntensity: "Intensité d'animation",
    notifications: 'Notifications',
    pushNotifications: 'Notifications push',
    language: 'Langue',
    support: 'Support',
    contactUs: 'Contactez-nous',
    rememberMe: 'Se souvenir de moi',
    staySignedIn: 'Rester connecté',
    goals: 'Objectifs',
    schedule: 'Horaire',
    progress: 'Progrès',
    discipline: 'Discipline',
    leaderboard: 'Classement',
    aiCoach: 'Coach IA',
  },
  de: {
    settings: 'Einstellungen',
    account: 'Konto',
    email: 'E-Mail',
    username: 'Benutzername',
    password: 'Passwort',
    changePassword: 'Passwort ändern',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestätigen',
    update: 'Aktualisieren',
    signOut: 'Abmelden',
    audio: 'Audio',
    soundEffects: 'Soundeffekte',
    ambientAudio: 'Umgebungsgeräusche (Wasser)',
    volume: 'Lautstärke',
    theme: 'Thema',
    softerTheme: 'Sanft (Wasser)',
    hackerTheme: 'Hacker (Matrix)',
    animations: 'Animationen',
    animationIntensity: 'Animationsintensität',
    notifications: 'Benachrichtigungen',
    pushNotifications: 'Push-Benachrichtigungen',
    language: 'Sprache',
    support: 'Support',
    contactUs: 'Kontaktieren Sie uns',
    rememberMe: 'Angemeldet bleiben',
    staySignedIn: 'Eingeloggt bleiben',
    goals: 'Ziele',
    schedule: 'Zeitplan',
    progress: 'Fortschritt',
    discipline: 'Disziplin',
    leaderboard: 'Rangliste',
    aiCoach: 'KI-Coach',
  },
};

interface I18nContextType {
  t: (key: string) => string;
  language: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useUserSettings();
  const language = settings.language || 'en';

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ t, language }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
