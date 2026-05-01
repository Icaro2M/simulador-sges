import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SimulationRequest } from "../../types/simulation";

interface Props {
  register: UseFormRegister<SimulationRequest>;
  errors: FieldErrors<SimulationRequest>;
}

const controlClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-medium text-red-600">{message}</span>;
}

export function ScenarioForm({ register, errors }: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">Identificação</h2>
        <p className="mt-1 text-sm text-slate-500">Dados gerais do cenário.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Nome do cenário
          <input className={controlClass} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Tecnologia
          <select className={controlClass} {...register("technology_type")}>
            <option value="tower">Tower</option>
            <option value="shaft">Shaft</option>
          </select>
          <FieldError message={errors.technology_type?.message} />
        </label>
      </div>
    </section>
  );
}
