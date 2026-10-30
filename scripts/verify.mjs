import assert from "node:assert/strict";

const { REPRO_HOSTNAME: host, VERSION_A: a, VERSION_B: b } = process.env;
const active = process.argv[2];
if (!host || !a || !b || !["a", "b"].includes(active)) {
  throw new Error("Set REPRO_HOSTNAME, VERSION_A, VERSION_B; run npm run verify -- a (or b at 100%).");
}
const versions = { a, b };
const idle = active === "a" ? "b" : "a";

async function check(path, status, version) {
  const response = await fetch(`https://${host}${path}`, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, status, path);
  assert.equal(response.headers.get("x-demo-version"), version, path);
  const body = await response.text();
  console.log(`${status} ${path} (release ${response.headers.get("x-demo-release")})`);
  return body;
}

await check("/", 200, versions[active]);
const html = await check(`/?__worker_version=${versions[idle]}`, 200, versions[idle]);
assert.ok(html.includes(`/assets/${idle}.js?__worker_version=${versions[idle]}`));
await check(`/assets/${idle}.js`, 404, versions[active]);
const asset = await check(`/assets/${idle}.js?__worker_version=${versions[idle]}`, 200, versions[idle]);
assert.ok(asset.includes(`Asset: release ${idle}`));
console.log("PASS: the query override selected the version at 0%.");
