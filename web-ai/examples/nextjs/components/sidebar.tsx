import Link from "next/link";

export default function Sidebar() {
  return (
    <>
      <nav className="col-md-3 col-lg-2 d-md-block sidebar collapse">
        <div className="position-sticky pt-3">
          <h5>Image models</h5>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link href="/demos/image-classification" className="nav-link active">
                Classification
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/segmentation" className="nav-link active">
                Segmentation
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/object-detection" className="nav-link active">
                Object detection
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/image-features" className="nav-link active">
                Feature extraction
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/super-resolution" className="nav-link active">
                Super-resolution
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/segment-anything" className="nav-link active">
                Segment Anything
              </Link>
            </li>
          </ul>
          <h5>Text models</h5>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link href="/demos/grammar-correction" className="nav-link active">
                Grammar correction
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/summarization" className="nav-link active">
                Summarization
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/text-features" className="nav-link active">
                Feature extraction
              </Link>
            </li>
          </ul>
          <h5>Multimodal models</h5>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link href="/demos/zero-shot" className="nav-link active">
                Zero-shot classification
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/demos/image-to-text" className="nav-link active">
                Image to text
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
