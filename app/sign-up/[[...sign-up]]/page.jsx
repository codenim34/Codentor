"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex items-center justify-center p-4">
      <style jsx global>{`
        .cl-headerTitle {
          display: none !important;
        }
        .cl-headerSubtitle {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: white !important;
          margin-bottom: 0.5rem !important;
        }
        .cl-headerSubtitle::before {
          content: "Create your Codentor account" !important;
          display: block !important;
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: white !important;
          margin-bottom: 0.5rem !important;
        }
      `}</style>
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-900 shadow-2xl border border-emerald-500/20 rounded-2xl",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "bg-gray-800 border border-emerald-500/30 hover:bg-gray-700 hover:border-emerald-500/50 text-white",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold normal-case shadow-lg",
              footerActionLink: "text-emerald-400 hover:text-emerald-300 font-medium",
              formFieldLabel: "text-gray-300 font-medium",
              formFieldInput: "bg-gray-800 border border-emerald-900/30 text-white focus:border-emerald-500 rounded-lg",
              formFieldInputShowPasswordButton: "text-gray-400 hover:text-emerald-400",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-emerald-400 hover:text-emerald-300",
              dividerLine: "bg-gray-700",
              dividerText: "text-gray-400",
              footer: "bg-gray-900 rounded-b-2xl",
              footerActionText: "text-gray-300",
              formFieldInputShowPasswordIcon: "text-gray-400",
              otpCodeFieldInput: "bg-gray-800 border-emerald-900/30 text-white",
              formResendCodeLink: "text-emerald-400 hover:text-emerald-300",
              identityPreview: "bg-gray-800 border border-emerald-900/30",
              alternativeMethodsBlockButton: "bg-gray-800 border border-emerald-900/30 hover:bg-gray-700 text-white",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
          }}
        />
      </div>
    </div>
  );
}
