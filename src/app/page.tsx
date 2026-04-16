import Link from "next/link";
import { OPERATIONS } from "@/lib/operations-registry";
import { NN_CHAPTERS } from "@/lib/nn-registry";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TRACKS = [
  {
    title: "Visual PyTorch",
    description:
      "Interactive, step-by-step visualizations for every PyTorch operation. Tweak inputs, watch animations, and build intuition for how tensors transform.",
    href: "/pytorch",
    emoji: "🔥",
    count: OPERATIONS.length,
    countLabel: "operations",
    available: true,
  },
  {
    title: "Visual NumPy",
    description:
      "Explore NumPy array operations visually. Understand broadcasting, slicing, and linear algebra through interactive diagrams.",
    href: "/numpy",
    emoji: "🔢",
    count: 0,
    countLabel: "operations",
    available: false,
  },
  {
    title: "Neural Network from Scratch",
    description:
      "Build a neural network step by step — from neurons to backpropagation. No frameworks, just pure math brought to life.",
    href: "/nn-from-scratch",
    emoji: "🧠",
    count: NN_CHAPTERS.length,
    countLabel: "chapters",
    available: true,
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">Visual Tutorials</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Interactive, visual learning for deep learning and scientific computing.
          Pick a track and build real intuition through hands-on exploration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRACKS.map((track) => (
          <Link key={track.href} href={track.href} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{track.emoji}</span>
                  {track.available ? (
                    <Badge variant="secondary">
                      {track.count} {track.countLabel}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Coming Soon</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{track.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{track.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
