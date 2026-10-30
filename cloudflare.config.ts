import { bindings, defineConfig } from "cf/config";
import { env } from "node:process";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

const { CLOUDFLARE_ACCOUNT_ID: accountId, REPRO_HOSTNAME: hostname } = env;
if (!accountId || !hostname) {
  throw new Error("Set CLOUDFLARE_ACCOUNT_ID and REPRO_HOSTNAME before running cf.");
}

export default defineConfig(({ mode }) => ({
  accountId,
  worker: {
    name: "workers-skew-protection-repro",
    compatibilityDate: "2026-10-29",
    compatibilityFlags: ["nodejs_compat"],
    entrypoint,
    domains: [hostname],
    assets: { runWorkerFirst: true },
    env: {
      RELEASE: bindings.text(mode === "b" ? "b" : "a"),
      ASSETS: bindings.assets(),
      CF_VERSION_METADATA: bindings.versionMetadata(),
    },
    observability: { enabled: true },
  },
}));
