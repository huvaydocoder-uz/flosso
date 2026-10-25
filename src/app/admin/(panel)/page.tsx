import { Plus } from "lucide-react";
import Link from "next/link";
import { getProducts } from "@/lib/repo";
import { AdminGuide } from "./AdminGuide";
import { ProductTable } from "./ProductTable";

export const dynamic = "force-dynamic";

export default async function ProductsAdmin({ searchParams }: PageProps<"/admin">) {
  const products = await getProducts({ includeInactive: true });
  const saved = (await searchParams).saved;

  return (
    <>
      <AdminGuide>
        <p>
          <b>Mahsulotlar</b> — katalogdagi har bir mahsulotning narxi, <b>chegirmasi (%)</b>, rasmi va nomi. Mahsulot narxidagi chegirma shu yerda qo‘yiladi va
          katalog, kalkulyator hamda arizalarda o‘zi hisoblanadi. Chegirma qo‘yilgan mahsulot saytdagi qizil aksiya bannerida ham o‘zi chiqadi.
        </p>
      </AdminGuide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-ink">Mahsulotlar</h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            {products.length} ta mahsulot · narx va chegirmani shu ro‘yxatning o‘zida o‘zgartiring, o‘zgarish saytga darhol chiqadi.
          </p>
        </div>
        <Link href="/admin/products/new" className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-red px-5 text-[15px] font-semibold text-white hover:bg-red-deep">
          <Plus className="size-4" aria-hidden="true" />
          Mahsulot qo‘shish
        </Link>
      </div>
      {typeof saved === "string" && (
        <p role="status" className="mt-4 rounded-[10px] bg-[#e7f4ea] px-4 py-3 text-[14px] font-medium text-[#1d6b34]">
          {saved} saqlandi.
        </p>
      )}
      <ProductTable products={products} />
    </>
  );
}
