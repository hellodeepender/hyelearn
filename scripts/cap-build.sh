#!/bin/bash
# Usage: ./scripts/cap-build.sh [el|hy] [android|ios]
LOCALE=${1:-el}
PLATFORM=${2:-android}

if [ "$LOCALE" = "el" ]; then
  URL="https://mathaino.net"
  APP_NAME="Mathaino"
  APP_ID="net.mathaino.app"
  BG_COLOR="#F0F7FF"
elif [ "$LOCALE" = "hy" ]; then
  URL="https://hyelearn.com"
  APP_NAME="HyeLearn"
  APP_ID="com.hyelearn.app"
  BG_COLOR="#FAF6EE"
else
  echo "Unknown locale: $LOCALE"
  exit 1
fi

echo "Building $APP_NAME for $PLATFORM..."

cat > capacitor.config.ts << EOF
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "$APP_ID",
  appName: "$APP_NAME",
  webDir: "public",
  server: {
    url: "$URL",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    scheme: "$APP_NAME",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "$BG_COLOR",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
    },
  },
};

export default config;
EOF

npx cap sync $PLATFORM
echo "Done. Open with: npx cap open $PLATFORM"
