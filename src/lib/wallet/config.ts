import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { bsc, bscTestnet, type AppKitNetwork } from "@reown/appkit/networks";

/** Get a free project id at https://dashboard.reown.com — required to enable wallet connect. */
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";

export const networks = [bscTestnet, bsc] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId: projectId || "unset",
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

export const appKitMetadata = {
  name: "Backstop",
  description: "The BNB agent marketplace with a reserve behind it.",
  url: "https://get-backstop.netlify.app",
  icons: ["https://get-backstop.netlify.app/icon.svg"],
};
