import { Link } from "react-router-dom";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Registration Submitted!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your registration has been submitted successfully. Our admin will
            review your application and notify you once it's approved.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What's next?</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-left list-disc list-inside space-y-1">
              <li>Admin will review your registration</li>
              <li>You'll receive a notification once approved</li>
              <li>Your membership will be activated upon approval</li>
            </ul>
          </div>

          <Link
            to="/members/register"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Register Another Member
          </Link>
        </div>
      </div>
    </div>
  );
}

