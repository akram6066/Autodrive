// "use client"

// import { useEffect, useState } from "react";
// import axios from "axios";
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import Link from "next/link";

// interface Product {
//   _id: string;
//   name: string;
//   price: number;
//   image: string;
// }

// export default function CategoryPage() {
//   const { slug } = useParams() as { slug: string };
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await axios.get(`/api/products/category/${slug}`);
//         setProducts(res.data);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [slug]);

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto py-10 px-4">
//         <h1 className="text-3xl font-bold text-primary mb-10 capitalize text-center">
//           {slug} Products
//         </h1>

//         {loading ? (
//           <div className="text-center text-lg text-secondary">Loading...</div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {products.map((product) => (
//               <Link href={`/product/${product._id}`} key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition">
//                 <Image src={product.image} alt={product.name} width={500} height={300} className="object-cover w-full h-60" />
//                 <div className="p-4">
//                   <h2 className="font-semibold text-lg">{product.name}</h2>
//                   <p className="text-primary font-bold">${product.price}</p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  image: string;
  brands: {
    brandName: string;
    sizes: { size: string; price: number }[];
  }[];
}

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`/api/products/category/${slug}`);
        setProducts(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-20 px-4">
        <h1 className="text-4xl font-bold text-primary mb-16 capitalize text-center">
          {slug} Products
        </h1>

        {loading ? (
          <div className="text-center text-lg text-secondary">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {products.map((product) => {
              // Get lowest price for display
              let lowestPrice = 0;
              if (product.brands.length > 0) {
                const prices = product.brands.flatMap(b => b.sizes.map(s => s.price));
                lowestPrice = Math.min(...prices);
              }

              return (
                <Link
                  href={`/product/${product._id}`}
                  key={product._id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden transition transform hover:scale-105 hover:shadow-2xl duration-300"
                >
                  <div className="relative w-full h-64">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-primary mb-3">
                      {product.name}
                    </h3>
                    <p className="text-primary text-xl font-bold">
                      Starting from ${lowestPrice}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
