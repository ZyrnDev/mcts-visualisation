import "./globals.css";
import "highlight.js/styles/vs2015.css";
import { PyodideProvider } from "@/components/pyodide";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PyodideProvider>
      <Component {...pageProps} />
    </PyodideProvider>
  );
}
