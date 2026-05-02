import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { SimulationRequest } from "../../types/simulation";

export interface ComparisonFormValues {
  scenarios: SimulationRequest[];
}

interface Props {
  index: number;
  register: UseFormRegister<ComparisonFormValues>;
  errors?: FieldErrors<SimulationRequest>;
  canRemove: boolean;
  onRemove: () => void;
}

const controlClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-medium text-red-600">{message}</span>;
}

function FormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

export function ComparisonScenarioForm({
  index,
  register,
  errors,
  canRemove,
  onRemove,
}: Props) {
  const title = `Cenário ${index + 1}`;
  const fieldPrefix = `scenarios.${index}` as const;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-900 px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-blue-300/30">
            {title}
          </span>
          <h2 className="mt-3 text-xl font-semibold">
            Parâmetros do {title.toLowerCase()}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Este bloco concentra todos os dados técnicos e econômicos deste cenário.
          </p>
        </div>

        {canRemove && (
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/10"
            onClick={onRemove}
          >
            Remover cenário
          </button>
        )}
      </div>

      <div className="grid gap-5 p-6">
        <FormGroup
          title="Identificação"
          description="Dados gerais do cenário comparado."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nome do cenário
              <input className={controlClass} {...register(`${fieldPrefix}.name`)} />
              <FieldError message={errors?.name?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Tecnologia
              <select
                className={controlClass}
                {...register(`${fieldPrefix}.technology_type`)}
              >
                <option value="tower">Tower</option>
                <option value="shaft">Shaft</option>
              </select>
              <FieldError message={errors?.technology_type?.message} />
            </label>
          </div>
        </FormGroup>

        <FormGroup
          title="Parâmetros físicos"
          description="Base física para energia armazenada e potência."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Massa (kg)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.mass_kg`, { valueAsNumber: true })}
              />
              <FieldError message={errors?.mass_kg?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Altura (m)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.height_m`, { valueAsNumber: true })}
              />
              <FieldError message={errors?.height_m?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Potência nominal (kW)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.nominal_power_kw`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.nominal_power_kw?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Potência de carga (kW)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.charge_power_kw`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.charge_power_kw?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Potência de descarga (kW)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.discharge_power_kw`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.discharge_power_kw?.message} />
            </label>
          </div>
        </FormGroup>
        <FormGroup
          title="Eficiências"
          description="Eficiências de carga e descarga."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Carga
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.charge_efficiency`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.charge_efficiency?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Descarga
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.discharge_efficiency`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.discharge_efficiency?.message} />
            </label>
          </div>
        </FormGroup>

        <FormGroup title="Perdas" description="Perdas por ciclo, fixas e em standby.">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Perda por ciclo
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.cycle_loss_fraction`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.cycle_loss_fraction?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Perda fixa por ciclo (kWh)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.fixed_cycle_loss_kwh`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.fixed_cycle_loss_kwh?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Perda standby (kWh/h)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.standby_loss_kwh_per_hour`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.standby_loss_kwh_per_hour?.message} />
            </label>
          </div>
        </FormGroup>

        <FormGroup
          title="Economia"
          description="Parâmetros econômicos para CAPEX, OPEX e LCOS."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Custo por kW
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.cost_per_kw`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.cost_per_kw?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Custo por kWh
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.cost_per_kwh`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.cost_per_kwh?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              CAPEX fixo
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.fixed_capex`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.fixed_capex?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              OPEX anual fixo
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.fixed_annual_opex`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.fixed_annual_opex?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              OPEX variável por MWh
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.variable_opex_per_mwh`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.variable_opex_per_mwh?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Vida útil (anos)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.project_lifetime_years`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.project_lifetime_years?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Taxa de desconto
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.discount_rate`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.discount_rate?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Ciclos por ano
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.cycles_per_year`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.cycles_per_year?.message} />
            </label>
          </div>
        </FormGroup>
      </div>
    </article>
  );
}
