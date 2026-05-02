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

export function EconomicsForm({ register, errors }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Economia</h2>
        <p className="mt-1 text-sm text-slate-500">
          Parâmetros para CAPEX, OPEX e LCOS.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Custo por kW
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("cost_per_kw", { valueAsNumber: true })}
          />
          <FieldError message={errors.cost_per_kw?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Custo por kWh
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("cost_per_kwh", { valueAsNumber: true })}
          />
          <FieldError message={errors.cost_per_kwh?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          CAPEX fixo
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("fixed_capex", { valueAsNumber: true })}
          />
          <FieldError message={errors.fixed_capex?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          OPEX anual fixo
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("fixed_annual_opex", { valueAsNumber: true })}
          />
          <FieldError message={errors.fixed_annual_opex?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          OPEX variável por MWh
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("variable_opex_per_mwh", { valueAsNumber: true })}
          />
          <FieldError message={errors.variable_opex_per_mwh?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Custo da energia de carga por MWh
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("charging_energy_cost_per_mwh", { valueAsNumber: true })}
          />
          <FieldError message={errors.charging_energy_cost_per_mwh?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Vida útil (anos)
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("project_lifetime_years", { valueAsNumber: true })}
          />
          <FieldError message={errors.project_lifetime_years?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Taxa de desconto
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("discount_rate", { valueAsNumber: true })}
          />
          <FieldError message={errors.discount_rate?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Ciclos por ano
          <input
            className={numberInputClass}
            type="number"
            step="any"
            {...register("cycles_per_year", { valueAsNumber: true })}
          />
          <FieldError message={errors.cycles_per_year?.message} />
        </label>
      </div>
    </section>
  );
}
