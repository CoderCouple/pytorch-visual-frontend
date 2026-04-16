import { Badge } from "@/components/ui/badge";

export default function NumPyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4 text-center py-16">
        <span className="text-6xl">🔢</span>
        <h1 className="text-4xl font-bold">Visual NumPy</h1>
        <Badge variant="outline" className="text-sm">
          Coming Soon
        </Badge>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Explore NumPy array operations visually. Understand broadcasting,
          slicing, and linear algebra through interactive diagrams.
        </p>
      </div>
    </div>
  );
}
