import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="bg-background">
      
      <Hero />
  
      <CategorySection />
      <FeaturedProducts />
     
      
      <Footer/>
    </div>
  );
}
