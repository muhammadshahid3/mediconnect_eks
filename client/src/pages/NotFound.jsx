import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="section py-24 text-center">
    <p className="eyebrow">404</p>
    <h1 className="text-3xl font-extrabold text-ink mt-2 mb-3">Page not found</h1>
    <p className="text-teal-600 mb-8">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="btn-primary">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
