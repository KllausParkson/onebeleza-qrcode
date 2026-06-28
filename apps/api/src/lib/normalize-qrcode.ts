/** Supabase retorna welcome_screens (array); normaliza para welcome_screen */
export function normalizeQrCode<T extends Record<string, unknown>>(raw: T) {
  const welcomeScreens = raw.welcome_screens;
  let welcome_screen = raw.welcome_screen;
  if (!welcome_screen && welcomeScreens) {
    welcome_screen = Array.isArray(welcomeScreens) ? welcomeScreens[0] : welcomeScreens;
  }
  const { welcome_screens: _removed, ...rest } = raw;
  return { ...rest, welcome_screen };
}
