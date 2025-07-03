import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
export default function BackToPage({ page }) {
  return (
    <Link to={`/${page}`} className="btn btn-sm btn-outline mb-4">
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to {page}
    </Link>
  );
}
