import { QRCodeSVG } from "qrcode.react";
import { memberCheckIn } from "../lib/api/member-checkin";
import toast from "react-hot-toast";

interface QRScannerProps {
  memberId: string;
  onCheckInSuccess?: () => void;
  onClose: () => void;
}

export default function QRScanner({
  memberId,
  onCheckInSuccess,
  onClose,
}: QRScannerProps) {
  const handleCheckIn = async () => {
    try {
      const result = await memberCheckIn(memberId);
      if (result.status === "ALLOWED") {
        toast.success("Check-in successful!");
        onCheckInSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(result.reason || "Check-in denied");
      }
    } catch (error: any) {
      toast.error(error.message || "Check-in failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Your QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <QRCodeSVG
                value={memberId}
                size={256}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Show this QR code at the gym for check-in
            </p>
          </div>

          {/* Member ID Display */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Member ID
            </label>
            <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
              {memberId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
