import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { memberCheckIn } from "../lib/api/member-checkin";
import toast from "react-hot-toast";
import type { CheckInResponse } from "../lib/api/member-checkin";

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch((err) => {
            console.error("Error stopping scanner:", err);
          });
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoContainerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        {
          facingMode: "environment", // Use back camera on mobile
        },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code detected
          handleQRCodeDetected(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent during scanning)
        }
      );

      setIsScanning(true);
    } catch (error: any) {
      toast.error("Unable to start camera. Please check permissions.");
      console.error("Camera start error:", error);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  const handleQRCodeDetected = async (memberId: string) => {
    if (isProcessing) return; // Prevent multiple simultaneous check-ins

    setIsProcessing(true);
    
    // Stop scanning temporarily
    if (scannerRef.current) {
      await stopScanning();
    }

    try {
      const result = await memberCheckIn(memberId.trim());
      setCheckInResult(result);
      
      if (result.status === "ALLOWED") {
        toast.success("Check-in successful!");
        // Auto-restart scanning after 3 seconds for next check-in
        setTimeout(() => {
          setCheckInResult(null);
          startScanning();
        }, 3000);
      } else {
        toast.error(result.reason || "Check-in denied");
      }
    } catch (error: any) {
      toast.error(error.message || "Check-in failed");
      setCheckInResult({
        success: false,
        status: "DENIED",
        message: error.message || "Check-in failed",
        reason: error.message || "Check-in failed",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanAgain = () => {
    setCheckInResult(null);
    startScanning();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            QR Code Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan member QR codes for check-in
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - QR Scanner */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Scanner
              </h2>
              {isScanning ? (
                <button
                  onClick={stopScanning}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Stop Scanning
                </button>
              ) : (
                <button
                  onClick={startScanning}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Start Scanning
                </button>
              )}
            </div>

            {/* Scanner Container */}
            <div className="relative">
              <div
                id="qr-reader"
                ref={videoContainerRef}
                className="w-full bg-black rounded-lg overflow-hidden"
                style={{ minHeight: "400px" }}
              ></div>

              {!isScanning && !isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <p className="text-white text-lg">Click "Start Scanning" to begin</p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Processing check-in...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Check-in Result */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Check-in Result
            </h2>

            {!checkInResult ? (
              <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Scan a QR code to see check-in results</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                      checkInResult.status === "ALLOWED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {checkInResult.status === "ALLOWED" ? (
                      <svg
                        className="w-6 h-6 mr-2"
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
                    ) : (
                      <svg
                        className="w-6 h-6 mr-2"
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
                    )}
                    {checkInResult.status}
                  </div>
                </div>

                {/* Member Information */}
                {checkInResult.member && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Member Information
                    </h3>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {checkInResult.member.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Member ID
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono">
                        {checkInResult.member.memberId || checkInResult.member.id}
                      </p>
                    </div>
                    {checkInResult.member.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {checkInResult.member.email}
                        </p>
                      </div>
                    )}
                    {checkInResult.member.endDate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Membership End Date
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(checkInResult.member.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reason/Message */}
                {checkInResult.reason && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Reason:</strong> {checkInResult.reason}
                    </p>
                  </div>
                )}

                {checkInResult.message && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {checkInResult.message}
                    </p>
                  </div>
                )}

                {/* Scan Again Button */}
                <button
                  onClick={handleScanAgain}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                >
                  Scan Another QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

