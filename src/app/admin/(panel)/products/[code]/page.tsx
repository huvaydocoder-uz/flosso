import { notFound } from "next/navigation";
import { getProductRow } from "@/lib/repo";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: PageProps<"/admin/products/[code]">) {
  const { code } = await params;
  const product = await getProductRow(decodeURIComponent(code));
  if (!product) notFound();

  return (
    <>
      <h1 className="mb-6 text-[26px] font-bold text-ink">
        Tahrirlash: <span className="tabular">{product.code}</span>
      </h1>
      <ProductForm product={product} />
    </>
  );
}
