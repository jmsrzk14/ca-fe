export interface Env {
    ASSETS: Fetcher;
    NEXT_PUBLIC_API_URL?: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // 1. Handle API Proxy (Moving rewrites from next.config.ts to Worker)
        if (url.pathname.startsWith('/api.')) {
            const backendUrl = env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
            const newUrl = new URL(url.pathname + url.search, backendUrl);

            // Create a new request to avoid header issues
            const newRequest = new Request(newUrl.toString(), {
                method: request.method,
                headers: request.headers,
                body: request.body,
                redirect: 'follow'
            });

            return await fetch(newRequest);
        }

        // 2. Serve Static Assets
        if (env.ASSETS) {
            return await env.ASSETS.fetch(request);
        }

        return new Response("Worker dot-ca-fe is running!", {
            headers: { "content-type": "text/plain" },
        });
    },
};
