import type { CapacitorConfig } from "@capacitor/cli";

type AppConfig = {
  appName: string;
  packageName: string;
};

const target =
  process.env.SCHOOL_CONFIG ||
  process.env.NEXT_PUBLIC_SCHOOL_CONFIG ||
  "abc-school";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require(`./configs/${target}.json`) as AppConfig;

const config: CapacitorConfig = {
  appId: app.packageName,
  appName: app.appName,
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;