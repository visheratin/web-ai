import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <hr />
        <p className="text-center">
          Powered by <a href="https://github.com/visheratin/web-ai">Web AI</a>.
        </p>
        <NextScript />
      </body>
    </Html>
  );
}
