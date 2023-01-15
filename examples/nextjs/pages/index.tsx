import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Web AI Next.js example</title>
        <meta name="description" content="Web AI Next.js example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container">
          <h1>Web AI Next.js example</h1>
          <h2>Image models</h2>
          <ol>
            <li>
              <Link href="/demos/classification">Classification</Link>
            </li>
            <li>
              <Link href="/demos/segmentation">Segmentation</Link>
            </li>
            <li>
              <a href="/demos/object-detection">Object detection</a>
            </li>
          </ol>
          <h2>Text models</h2>
          <ol>
            <li>
              <a href="/demos/grammar-correction">Grammar correction</a>
            </li>
            <li>
              <a href="/demos/feature-extraction">Feature extraction</a>
            </li>
          </ol>
        </div>
      </main>
    </>
  );
}
