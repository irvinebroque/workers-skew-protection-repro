export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const version = env.CF_VERSION_METADATA.id;
    let response: Response;

    if (url.pathname === "/") {
      response = new Response(`<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Worker version override repro</title>
<p>HTML: release ${env.RELEASE}</p>
<p id="asset">Asset has not loaded.</p>
<script src="/assets/${env.RELEASE}.js?__worker_version=${encodeURIComponent(version)}"></script>
</html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
    } else {
      // The platform has already selected the version and its asset manifest.
      const asset = await env.ASSETS.fetch(request);
      response = new Response(asset.body, asset);
    }

    response.headers.set("cache-control", "no-store");
    response.headers.set("x-demo-release", env.RELEASE);
    response.headers.set("x-demo-version", version);
    return response;
  },
} satisfies ExportedHandler<Env>;
