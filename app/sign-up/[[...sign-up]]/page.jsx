import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-900/50 backdrop-blur-sm shadow-2xl border border-emerald-900/30",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-800 border-emerald-900/30 hover:bg-gray-700",
              formButtonPrimary: "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-gray-800 border-emerald-900/30 text-white",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-emerald-400",
            },
          }}
        />
      </div>
    </div>
  );
}
