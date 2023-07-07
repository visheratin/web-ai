import "bootstrap/dist/css/bootstrap.css";
import type { AppProps } from "next/app";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import Header from "../components/header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <main>
        <div className="container">
          <div className="row">
            <Header />
            <Sidebar />
            <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <Component {...pageProps} />
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}
