import { Link } from "react-router-dom";
import { FilePlus, ClipboardList } from "lucide-react";
import BackToPage from "../components/BackToPage";

export default function QuestionPanel() {
  return (
    <div className="min-h-screen px-6 py-10 bg-base-200">
      <BackToPage page={"dashboard"} />
      <h2 className="text-4xl font-bold text-center text-info mb-24">
        Question Panel
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card bg-info/10 border border-info">
          <div className="card-body flex gap-10 justify-between">
            <div className="space-y-3 text-left">
              <h3 className="card-title text-info text-2xl">
                Submit a New Question
              </h3>
              <p>Contribute to the game by submitting your own questions!</p>
            </div>
            <div className="flex items-center justify-center">
              <Link
                to="/question/new"
                className="btn btn-info text-base px-6 py-2 min-h-[2.5rem] min-w-[8rem]"
              >
                <FilePlus className="w-5 h-5 mr-1" />
                Submit
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-secondary/10 border border-secondary">
          <div className="card-body flex gap-10 justify-between">
            <div className="space-y-3 text-left">
              <h3 className="card-title text-secondary text-2xl">
                My Question Status
              </h3>
              <p>Track the approval status of your submitted questions.</p>
            </div>
            <div className="flex items-center justify-center">
              <Link
                to="/question/status"
                className="btn btn-secondary text-base px-6 py-2 min-h-[2.5rem] min-w-[8rem]"
              >
                <ClipboardList className="w-5 h-5 mr-1" />
                View Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
