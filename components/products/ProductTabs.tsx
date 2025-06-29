import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProductTabs({ description }: { description: string }) {
  return (
    <section className="mt-20">
      <Tabs defaultValue="details">
        <TabsList className="flex justify-center mb-8">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <p>{description}</p>
        </TabsContent>
        <TabsContent value="shipping">
          <p>Free shipping on orders over KSh 100,000</p>
        </TabsContent>
        <TabsContent value="returns">
          <p>Returns within 30 days of delivery.</p>
        </TabsContent>
      </Tabs>
    </section>
  );
}
