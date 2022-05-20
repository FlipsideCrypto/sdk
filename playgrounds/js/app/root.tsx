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

const description = "Flipside SDK. Blockchain Data Where You Want It.";
const image = "https://sdk.flipsidecrypto.xyz/sdk-site-preview.png";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Flipside SDK",
  viewport: "width=device-width,initial-scale=1",
  description: description,
  "og:title": "Flipside SDK",
  "og:description": description,
  "og:image": image,
  "og:url": "https://sdk.flipsidecrypto.xyz",
  "og:type": "website",
  "twitter:card": "summary_large_image",
  "twitter:title": "Flipside SDK",
  "twitter:description": description,
  "twitter:image": image,
  "twitter:url": "https://sdk.flipsidecrypto.xyz",
  "twitter:domain": "sdk.flipsidecrypto.xyz",
});

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export async function loader({ request }: { request: Request }) {
  return {
    ENV: {
      FLIPSIDE_API_KEY: process.env.FLIPSIDE_API_KEY,
      FLIPSIDE_BASE_URL: process.env.FLIPSIDE_BASE_URL,
      GA_TRACKING_ID: process.env.GA_TRACKING_ID,
    },
  };
}

export default function App() {
  const data = useLoaderData<{
    ENV: Record<string, string>;
  }>();
  return (
    <Document env={data.ENV} title="Flipside SDK Playground">
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
        {process.env.NODE_ENV === "development" ||
        !env?.GA_TRACKING_ID ? null : (
          <script
            src={`https://www.googletagmanager.com/gtag/js?id=${env.GA_TRACKING_ID}`}
          />
        )}
      </head>

      <body className="antialiased min-h-screen">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
