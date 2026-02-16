 "use client";
 
 import { useState } from "react";
 
 export default function ForgotPasswordPage() {
     const [email, setEmail] = useState("");
     const [submitted, setSubmitted] = useState(false);
 
     function handleSubmit(e: React.FormEvent) {
         e.preventDefault();
         setSubmitted(true);
     }
 
     return (
     <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center px-4">
       <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-2xl p-6 sm:p-8">
         <div className="flex flex-col items-center text-center">
           <img
             src="/moneymate-logo.png"
             alt="MoneyMate logo"
             className="h-14 w-14 rounded-xl"
           />
           <h1 className="mt-4 text-2xl font-bold text-emerald-700">Reset password</h1>
           <p className="text-sm text-gray-500">
             Enter your email and we&apos;ll send you reset instructions.
           </p>
         </div>
 
         <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
           <div className="grid gap-2">
             <label className="text-sm font-medium text-gray-700" htmlFor="email">
               Email
             </label>
             <input
               id="email"
               className="h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
               placeholder="you@email.com"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
           </div>
 
           <button
             type="submit"
             className="h-11 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
           >
             Send reset link
           </button>
 
           {submitted && (
             <p className="text-sm text-emerald-700 text-center">
               If that email exists, you&apos;ll receive a reset link shortly.
             </p>
           )}
 
           <p className="text-xs text-gray-500 text-center">
             Remembered your password?{" "}
             <a className="text-emerald-700 font-semibold hover:underline" href="/login">
               Back to sign in
             </a>
           </p>
         </form>
       </div>
     </main>
   );
 }
