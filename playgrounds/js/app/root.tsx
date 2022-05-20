import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "./tailwind.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function loader({ request }: { request: Request }) {
  return {
    ENV: {
      FLIPSIDE_API_KEY: process.env.FLIPSIDE_API_KEY,
      FLIPSIDE_BASE_URL: process.env.FLIPSIDE_BASE_URL,
    },
  };
}

export default function App() {
  const data = useLoaderData<{ ENV: Record<string, string> }>();
  return (
    <Document env={data.ENV} title="Playground - JS">
      <Outlet />
    </Document>
  );
}

function Document({
  children,
  title,
  env,
}: {
  children: React.ReactNode;
  title?: string;
  env?: Record<string, string>;
}) {
  return (
    <html lang="en">
      <head>
        {env ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(
                env
              )}; var global = global || window;`,
            }}
          />
        ) : null}

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>

      <body className="antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
