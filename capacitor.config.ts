import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "org.diasporalearn.app",
  appName: "DiasporaLearn",
  webDir: "public",
  server: {
    url: "https://mathaino.net",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    scheme: "DiasporaLearn",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#F0F7FF",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
    },
  },
};

export default config;
