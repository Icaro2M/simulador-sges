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

export function TechnologyForm({ register, errors }: Props) {
  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Parâmetros físicos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Base para o cálculo energético.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Massa (kg)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("mass_kg", { valueAsNumber: true })}
            />
            <FieldError message={errors.mass_kg?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Altura (m)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("height_m", { valueAsNumber: true })}
            />
            <FieldError message={errors.height_m?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Potência nominal (kW)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("nominal_power_kw", { valueAsNumber: true })}
            />
            <FieldError message={errors.nominal_power_kw?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">Eficiências</h2>
          <p className="mt-1 text-sm text-slate-500">
            Conversão, recuperação e perdas internas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Motor
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("motor_efficiency", { valueAsNumber: true })}
            />
            <FieldError message={errors.motor_efficiency?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Gerador
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("generator_efficiency", { valueAsNumber: true })}
            />
            <FieldError message={errors.generator_efficiency?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Mecânica
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("mechanical_efficiency", { valueAsNumber: true })}
            />
            <FieldError message={errors.mechanical_efficiency?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Auxiliar
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("auxiliary_efficiency", { valueAsNumber: true })}
            />
            <FieldError message={errors.auxiliary_efficiency?.message} />
          </label>
        </div>
      </section>
    </>
  );
}
