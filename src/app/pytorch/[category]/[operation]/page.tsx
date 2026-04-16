import { notFound } from "next/navigation";
import { OPERATIONS, CATEGORIES } from "@/lib/operations-registry";
import { OperationView } from "@/components/operations/operation-view";

interface PageProps {
  params: Promise<{ category: string; operation: string }>;
}

export default async function OperationPage({ params }: PageProps) {
  const { category, operation: opId } = await params;

  const op = OPERATIONS.find((o) => o.id === opId && o.categorySlug === category);
  if (!op) notFound();

  const cat = CATEGORIES.find((c) => c.slug === category);

  return (
    <div>
      <OperationView operation={op} />
    </div>
  );
}

export function generateStaticParams() {
  return OPERATIONS.map((op) => ({
    category: op.categorySlug,
    operation: op.id,
  }));
}
