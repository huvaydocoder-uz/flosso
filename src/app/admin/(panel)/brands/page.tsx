import { listBrands } from "@/lib/repo";
import { BrandsAdmin } from "./BrandsAdmin";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await listBrands();
  return (
    <div className="max-w-[900px]">
      <h1 className="text-[26px] font-bold text-ink">Bizga ishongan brendlar</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        FLOSSO bilan haqiqatan ishlagan kompaniyalarni qo‘shing (logotip + nom). Saytda ular «Biz haqimizda» va «Aloqa» orasida, penoplast ramkalar ichida aylanib turadi. Bironta ham faol brend bo‘lmasa, bo‘lim
        saytda ko‘rinmaydi.
      </p>
      <BrandsAdmin items={brands.map((b) => ({ id: b.id, name: b.name, logo: b.logo, sortOrder: b.sortOrder, active: b.active }))} />
    </div>
  );
}
