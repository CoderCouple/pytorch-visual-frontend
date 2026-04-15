import Link from "next/link";
import { CATEGORIES, OPERATIONS } from "@/lib/operations-registry";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">
          <span className="text-[#EE4C2C]">PyTorch</span> Visual
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Interactive, step-by-step visualizations for every PyTorch operation.
          Tweak inputs, watch animations, and build intuition for how tensors transform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const ops = OPERATIONS.filter((op) => op.categorySlug === cat.slug);
          return (
            <Card key={cat.slug} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                <CardDescription>{ops.length} operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ops.map((op) => (
                    <Link key={op.id} href={`/operations/${cat.slug}/${op.id}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-[#EE4C2C] hover:text-white hover:border-[#EE4C2C] transition-colors font-mono text-xs"
                      >
                        {op.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
