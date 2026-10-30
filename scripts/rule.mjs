const { REPRO_HOSTNAME: host, VERSION_A: a, VERSION_B: b } = process.env;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
if (!host || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host)
  || !uuid.test(a ?? "") || !uuid.test(b ?? "") || a === b) {
  throw new Error("Set REPRO_HOSTNAME and two distinct version UUIDs: VERSION_A and VERSION_B.");
}

const rule = {
  description: "Pin repro requests to the version in their asset URL",
  action: "rewrite",
  expression: `(http.host eq "${host}" and http.request.uri.path in {"/" "/assets/a.js" "/assets/b.js"} and http.request.uri.args["__worker_version"][0] in {"${a}" "${b}"})`,
  action_parameters: { headers: { "cloudflare-workers-version-overrides": {
    operation: "set",
    expression: 'concat("workers-skew-protection-repro=\\\"", http.request.uri.args["__worker_version"][0], "\\\"")',
  } } },
};

const body = process.argv.includes("--ruleset")
  ? { name: "Request header transforms", kind: "zone", phase: "http_request_late_transform", rules: [rule] }
  : rule;
console.log(JSON.stringify(body, null, 2));
