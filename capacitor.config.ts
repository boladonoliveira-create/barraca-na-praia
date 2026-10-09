import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jogosbr.barracanapraia',
  appName: 'Barraca na Praia',
  webDir: 'dist',
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: '#f6e3b4', showSpinner: false },
  },
};

export default config;
