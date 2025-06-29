import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">This page Not Found</p>
      <Link href="/" className="text-primary font-semibold underline">
        Go back to Home
      </Link>
    </div>
  );
}
