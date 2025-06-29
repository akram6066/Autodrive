"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-[300px] md:h-[400px] lg:h-[550px] overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.png"
          alt="Hero Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Text Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center h-full px-4">
        <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
          The Best Auto Parts Store
        </h1>
        <p className="text-white text-base md:text-lg max-w-xl drop-shadow-md">
          Shop premium quality Tires, Batteries and Rims at unbeatable prices.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-xl text-base md:text-lg font-semibold transition"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}
