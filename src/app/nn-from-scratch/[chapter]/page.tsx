import { notFound } from "next/navigation";
import { NN_CHAPTERS } from "@/lib/nn-registry";
import { OperationView } from "@/components/operations/operation-view";
import { NeuronChapter } from "@/components/nn/neuron-chapter";
import { DotProductChapter } from "@/components/nn/dot-product-chapter";

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { chapter } = await params;

  const ch = NN_CHAPTERS.find((c) => c.id === chapter);
  if (!ch) notFound();

  if (chapter === "neuron") {
    return <NeuronChapter />;
  }

  if (chapter === "dot-product") {
    return <DotProductChapter />;
  }

  return (
    <div>
      <OperationView operation={ch} />
    </div>
  );
}

export function generateStaticParams() {
  return NN_CHAPTERS.map((ch) => ({
    chapter: ch.id,
  }));
}
