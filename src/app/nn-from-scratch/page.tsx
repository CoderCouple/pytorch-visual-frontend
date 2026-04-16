import Link from "next/link";
import { NN_CHAPTERS } from "@/lib/nn-registry";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NNFromScratchPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">
          <span className="text-[#8B5CF6]">Neural Network</span> from Scratch
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Build a neural network step by step — from neurons to backpropagation.
          No frameworks, just pure math brought to life.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NN_CHAPTERS.map((ch) => (
          <Card key={ch.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{ch.name}</CardTitle>
              <CardDescription>{ch.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/nn-from-scratch/${ch.id}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-[#8B5CF6] hover:text-white hover:border-[#8B5CF6] transition-colors font-mono text-xs"
                >
                  {ch.name}
                </Badge>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
