import { listLeads } from "@/lib/repo";
import { LeadList } from "./LeadList";

export const dynamic = "force-dynamic";

export default async function LeadsAdmin() {
  const leads = await listLeads();
  const fresh = leads.filter((l) => l.status === "new").length;

  return (
    <>
      <h1 className="text-[26px] font-bold text-ink">Arizalar</h1>
      <p className="mt-1 text-[14px] text-ink-soft">
        Jami {leads.length} ta · yangi: <b className="text-red">{fresh}</b>. Telefon raqamini bossangiz, qo‘ng‘iroq qilinadi.
      </p>
      <LeadList
        leads={leads.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
