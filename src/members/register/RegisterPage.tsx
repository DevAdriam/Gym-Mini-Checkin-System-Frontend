import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  useAvailablePackages,
  useRegisterMember,
} from "../../lib/hooks/use-member-register";
import { useCheckMemberStatus } from "../../lib/hooks/use-member-status";
import ImageUpload from "../../components/ImageUpload";
import { uploadImage } from "../../lib/api/image-upload";
import type {
  MembershipPackage,
  PaymentScreenshotDto,
} from "../../types/index";

// LocalStorage key for member email
const MEMBER_EMAIL_KEY = "gym_member_email";

// Step 1: Information Schema
const informationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  profilePhoto: z.string().optional(),
});

// Step 2: Package Selection (no schema needed, just selection)
// Step 3: Payment Screenshots (handled separately)

type InformationFormData = z.infer<typeof informationSchema>;

export default function MemberRegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] =
    useState<MembershipPackage | null>(null);
  const [paymentScreenshots, setPaymentScreenshots] = useState<
    PaymentScreenshotDto[]
  >([]);
  const [screenshotDescription, setScreenshotDescription] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  // Store files temporarily for upload after registration
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [paymentScreenshotFiles, setPaymentScreenshotFiles] = useState<
    Array<{ file: File; description?: string }>
  >([]);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const email = localStorage.getItem(MEMBER_EMAIL_KEY);
    if (email) {
      setStoredEmail(email);
    }
  }, []);

  const { data: packages, isLoading: packagesLoading } = useAvailablePackages();
  const registerMutation = useRegisterMember();

  // Check member status if email is stored
  const { data: statusData, isLoading: statusLoading } = useCheckMemberStatus(
    storedEmail || ""
  );

  // Handle status check result
  useEffect(() => {
    if (statusData && storedEmail) {
      // Use status from response (it's already normalized in the API function)
      const status = statusData.status;
      if (status === "PENDING") {
        setShowPendingModal(true);
      } else if (status === "REJECTED") {
        setShowRejectedModal(true);
      } else if (status === "APPROVED" || status === "ACTIVE") {
        // Redirect to dashboard immediately
        navigate("/members/dashboard", {
          state: { member: statusData.member },
        });
      }
    }
  }, [statusData, storedEmail, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
  } = useForm<InformationFormData>({
    resolver: zodResolver(informationSchema),
    mode: "onChange", // Enable real-time validation
  });

  // Watch the name field for real-time updates
  const watchedName = watch("name");

  const packagesList = Array.isArray(packages) ? packages : [];

  const handleNext = () => {
    if (currentStep === 1) {
      handleSubmit(() => {
        setCurrentStep(2);
      })();
    } else if (currentStep === 2) {
      if (selectedPackage) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle profile photo file selection (for registration flow)
  const handleProfilePhotoSelect = (file: File) => {
    setProfilePhotoFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle payment screenshot file selection (for registration flow)
  const handleScreenshotFileSelect = (file: File) => {
    setPaymentScreenshotFiles([
      ...paymentScreenshotFiles,
      {
        file,
        description: screenshotDescription || undefined,
      },
    ]);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentScreenshots([
        ...paymentScreenshots,
        {
          imageUrl: reader.result as string, // Temporary preview URL
          description: screenshotDescription || undefined,
        },
      ]);
    };
    reader.readAsDataURL(file);
    setScreenshotDescription("");
  };

  const handleRemoveScreenshot = (index: number) => {
    setPaymentScreenshots(paymentScreenshots.filter((_, i) => i !== index));
  };

  const handleSubmitRegistration = async () => {
    if (!selectedPackage || paymentScreenshotFiles.length === 0) {
      return;
    }

    const formData = getValues();
    // Submit registration first (without images, or with placeholder URLs)
    const registrationData = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      profilePhoto: undefined, // Will upload after registration
      membershipPackageId: selectedPackage.id,
      paymentScreenshots: [], // Will upload after registration
    };

    registerMutation.mutate(registrationData, {
      onSuccess: async (response: any) => {
        const memberId =
          response.memberId ||
          response._data?.data?.member?.id ||
          response._data?.data?.id;

        // Store email in localStorage
        if (formData.email) {
          localStorage.setItem(MEMBER_EMAIL_KEY, formData.email);
          setStoredEmail(formData.email);
        }

        if (!memberId) {
          console.error("Member ID not found in response");
          navigate("/members/register/success");
          return;
        }

        // Upload images after registration
        try {
          // Upload profile photo if exists
          if (profilePhotoFile) {
            await uploadImage(memberId, profilePhotoFile, "PROFILE");
          }

          // Upload payment screenshots
          for (const screenshot of paymentScreenshotFiles) {
            await uploadImage(
              memberId,
              screenshot.file,
              "PAYMENT_SCREENSHOT",
              screenshot.description
            );
          }

          // Navigate to success page
          navigate("/members/register/success");
        } catch (error: any) {
          console.error("Error uploading images:", error);
          // Still navigate to success page even if image upload fails
          navigate("/members/register/success");
        }
      },
    });
  };

  // Show loading while checking status
  if (statusLoading && storedEmail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Checking registration status...
        </div>
      </div>
    );
  }

  // Don't show form if status is APPROVED/ACTIVE (redirecting)
  if (
    statusData &&
    (statusData.status === "APPROVED" || statusData.status === "ACTIVE")
  ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                  <div className="mt-2 text-xs text-center text-gray-600 dark:text-gray-400">
                    {step === 1
                      ? "Information"
                      : step === 2
                      ? "Package"
                      : "Payment"}
                  </div>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Step 1: Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Personal Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Please provide your personal details
                </p>
              </div>

              <form onSubmit={handleSubmit(() => setCurrentStep(2))}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <ImageUpload
                      label="Profile Photo (Optional)"
                      onFileSelect={handleProfilePhotoSelect}
                      currentImageUrl={profilePhotoUrl}
                      maxSizeMB={5}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Package Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose Membership Package
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a membership package that suits you
                </p>
              </div>

              {packagesLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600 dark:text-gray-400">
                    Loading packages...
                  </div>
                </div>
              ) : packagesList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600 dark:text-gray-400">
                    No packages available
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packagesList.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPackage?.id === pkg.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {pkg.title}
                        </h3>
                        {selectedPackage?.id === pkg.id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
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
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {pkg.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${pkg.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {pkg.durationDays} days
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Screenshot */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment Screenshot
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload your payment screenshot(s)
                </p>
              </div>

              {selectedPackage && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Selected Package:</span>{" "}
                    {selectedPackage.title} - $
                    {selectedPackage.price.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <ImageUpload
                    label="Payment Screenshot *"
                    onFileSelect={handleScreenshotFileSelect}
                    maxSizeMB={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={screenshotDescription}
                    onChange={(e) => setScreenshotDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Initial payment"
                    onKeyDown={(e) => {
                      // Allow adding description when Enter is pressed (but don't submit)
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Add a description for the last uploaded screenshot
                  </p>
                </div>
              </div>

              {/* Added Screenshots List */}
              {paymentScreenshots.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Added Screenshots ({paymentScreenshots.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentScreenshots.map((screenshot, index) => (
                      <div
                        key={index}
                        className="relative p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <img
                          src={screenshot.imageUrl}
                          alt={`Payment screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded mb-2"
                        />
                        {screenshot.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {screenshot.description}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !selectedPackage) ||
                  (currentStep === 1 && (!watchedName || !isValid))
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitRegistration}
                disabled={
                  paymentScreenshotFiles.length === 0 ||
                  registerMutation.isPending
                }
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending
                  ? "Submitting..."
                  : "Submit Registration"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PENDING Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Registration Under Review
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You have already registered. Your registration is currently
                under review. Please wait for approval.
              </p>
            </div>
            <button
              onClick={() => setShowPendingModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* REJECTED Modal */}
      {showRejectedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
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
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Registration Rejected
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your registration has been rejected. You can register again with
                updated information.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  localStorage.removeItem(MEMBER_EMAIL_KEY);
                  setStoredEmail(null);
                  setShowRejectedModal(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Register Again
              </button>
              <button
                onClick={() => setShowRejectedModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
