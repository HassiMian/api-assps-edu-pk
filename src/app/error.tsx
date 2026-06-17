"use client";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
        <p className="text-slate-400">An unexpected error occurred while rendering this page. Please refresh or try again later.</p>
      </div>
    </div>
  );
}
