# Ferrous Explorer

Block explorer for the Ferrous Network (Next.js 16 + TypeScript + Tailwind 4). Reads live testnet data via a server-side RPC proxy.

## Local development

Run on **port 3005**, not the Next.js default 3000 — Grafana (run in WSL2) also defaults to 3000 and the two flap over `localhost:3000` via WSL's port relay:

```bash
npx next dev -p 3005
# then open http://localhost:3005
```

Requires `.env.local` (gitignored) with `SEED1_URL`/`SEED4_URL` (SSH-tunnelled RPC, e.g. `http://127.0.0.1:18331`) and `SEED1_COOKIE`/`SEED4_COOKIE` (from each node's `/root/ferrous/data/.rpc.cookie`). Open the tunnels first:

```bash
ssh -f -N -L 18331:127.0.0.1:8332 root@45.77.153.141   # seed1
ssh -f -N -L 18332:127.0.0.1:8332 root@45.77.64.221    # seed4
```

Edit pages under `app/`; the dev server hot-reloads.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
