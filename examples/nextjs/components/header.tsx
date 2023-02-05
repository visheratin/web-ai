import Link from "next/link";

export default function Header() {
  return (
    <>
      <nav className="navbar">
        <div className="container-fluid justify-content-center">
          <Link className="navbar-brand" href="/">
            <h3>Web AI examples</h3>
          </Link>
        </div>
      </nav>
    </>
  );
}
