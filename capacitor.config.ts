import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "org.diasporalearn.app",
  appName: "DiasporaLearn",
  webDir: "public",
  server: {
    url: "https://diasporalearn.org",
    cleartext: false,
    allowNavigation: [
      "diasporalearn.org",
      "*.diasporalearn.org",
      "hyelearn.com",
      "*.hyelearn.com",
      "mathaino.net",
      "*.mathaino.net",
      "ta3allam.org",
      "*.ta3allam.org",
    ],
  },
  ios: {
    contentInset: "always",
    scheme: "DiasporaLearn",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#F0F7FF",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
    },
  },
};

export default config;
