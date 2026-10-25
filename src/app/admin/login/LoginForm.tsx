"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

const field =
  "mt-2 block min-h-12 w-full rounded-[10px] border border-line bg-foam px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow,background-color] focus:border-red focus:bg-white focus:shadow-[0_0_0_3px_rgb(198_40_40/0.15)]";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="text-[14px] font-semibold text-ink">
          Email
        </label>
        <input key={state?.email} id="email" name="email" type="email" autoComplete="username" defaultValue={state?.email} required className={field} />
      </div>
      <div>
        <label htmlFor="password" className="text-[14px] font-semibold text-ink">
          Parol
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus={Boolean(state?.error)} className={field} />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-[10px] bg-red/[0.07] px-4 py-3 text-[14px] font-medium text-red-deep">
          {state.error === "rate" ? "Juda ko‘p urinish. 15 daqiqadan keyin qayta urinib ko‘ring." : "Email yoki parol noto‘g‘ri."}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-red px-6 text-[16px] font-semibold text-white hover:bg-red-deep disabled:opacity-80"
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Kirish
      </button>
    </form>
  );
}
