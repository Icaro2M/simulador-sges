import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SimulationRequest } from "../../types/simulation";

interface Props {
  register: UseFormRegister<SimulationRequest>;
  errors: FieldErrors<SimulationRequest>;
}

const numberInputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-medium text-red-600">{message}</span>;
}

export function LossesForm({ register, errors }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Perdas</h2>
        <p className="mt-1 text-sm text-slate-500">
          Perdas fixas, por ciclo e em standby.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Perda por ciclo
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("cycle_loss_fraction", { valueAsNumber: true })}
          />
          <FieldError message={errors.cycle_loss_fraction?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Perda fixa por ciclo (kWh)
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("fixed_cycle_loss_kwh", { valueAsNumber: true })}
          />
          <FieldError message={errors.fixed_cycle_loss_kwh?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Perda standby (kWh/h)
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("standby_loss_kwh_per_hour", { valueAsNumber: true })}
          />
          <FieldError message={errors.standby_loss_kwh_per_hour?.message} />
        </label>
      </div>
    </section>
  );
}
