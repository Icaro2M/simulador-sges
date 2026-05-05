import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";

import type { SimulationRequest } from "../../types/simulation";
import {
  calculateTechnologyPreview,
  formatTechnologyNumber,
} from "../../utils/technologyModel";

export interface ComparisonFormValues {
  scenarios: SimulationRequest[];
}

interface Props {
  index: number;
  register: UseFormRegister<ComparisonFormValues>;
  control: Control<ComparisonFormValues>;
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

const optionalNumber = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
};

export function ComparisonScenarioForm({
  index,
  register,
  control,
  errors,
  canRemove,
  onRemove,
}: Props) {
  const title = `Cenário ${index + 1}`;
  const fieldPrefix = `scenarios.${index}` as const;
  const technologyType = useWatch({
    control,
    name: `${fieldPrefix}.technology_type`,
  });
  const watchedScenario = useWatch({
    control,
    name: fieldPrefix,
  }) as SimulationRequest;
  const technologyPreview = calculateTechnologyPreview(watchedScenario);

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
              Massa base/fallback (kg)
              <input
                className={controlClass}
                type="number"
                step="any"
                {...register(`${fieldPrefix}.mass_kg`, { valueAsNumber: true })}
              />
              <FieldError message={errors?.mass_kg?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Altura/profundidade base (m)
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
          title="Modelo especifico da tecnologia"
          description="Campos opcionais para massa efetiva, curso util e CAPEX especifico."
        >
          {technologyType === "tower" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Quantidade de blocos
                <input
                  className={controlClass}
                  type="number"
                  min={1}
                  {...register(`${fieldPrefix}.block_count`, optionalNumber)}
                />
                <FieldError message={errors?.block_count?.message} />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Massa por bloco kg
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  step="any"
                  {...register(`${fieldPrefix}.mass_per_block_kg`, optionalNumber)}
                />
                <FieldError message={errors?.mass_per_block_kg?.message} />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Fracao de altura util
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  max={1}
                  step="0.01"
                  {...register(`${fieldPrefix}.usable_height_fraction`, {
                    valueAsNumber: true,
                  })}
                />
                <FieldError message={errors?.usable_height_fraction?.message} />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Custo estrutural por metro
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  step="any"
                  {...register(`${fieldPrefix}.structure_cost_per_meter`, {
                    valueAsNumber: true,
                  })}
                />
                <FieldError message={errors?.structure_cost_per_meter?.message} />
              </label>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Fracao de profundidade util
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  max={1}
                  step="0.01"
                  {...register(`${fieldPrefix}.usable_depth_fraction`, {
                    valueAsNumber: true,
                  })}
                />
                <FieldError message={errors?.usable_depth_fraction?.message} />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Custo de reabilitacao do poco
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  step="any"
                  {...register(`${fieldPrefix}.shaft_rehabilitation_cost`, {
                    valueAsNumber: true,
                  })}
                />
                <FieldError message={errors?.shaft_rehabilitation_cost?.message} />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Densidade do material kg/m3
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  step="any"
                  {...register(`${fieldPrefix}.material_density_kg_m3`, optionalNumber)}
                />
                <FieldError message={errors?.material_density_kg_m3?.message} />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Volume do container m3
                <input
                  className={controlClass}
                  type="number"
                  min={0}
                  step="any"
                  {...register(`${fieldPrefix}.container_volume_m3`, optionalNumber)}
                />
                <FieldError message={errors?.container_volume_m3?.message} />
              </label>
            </div>
          )}
        </FormGroup>

        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <span className="block text-xs font-medium text-blue-700">
                Massa efetiva prevista
              </span>
              <strong className="mt-1 block text-lg font-semibold text-blue-950">
                {formatTechnologyNumber(technologyPreview.effectiveMassKg)} kg
              </strong>
              <span className="mt-1 block text-xs font-medium text-blue-700">
                {technologyPreview.massSourceDetail}
              </span>
            </div>

            <div>
              <span className="block text-xs font-medium text-blue-700">
                {technologyType === "tower"
                  ? "Altura util prevista"
                  : "Profundidade util prevista"}
              </span>
              <strong className="mt-1 block text-lg font-semibold text-blue-950">
                {formatTechnologyNumber(technologyPreview.usableDistanceM)} m
              </strong>
            </div>

            <div>
              <span className="block text-xs font-medium text-blue-700">
                Capacidade fisica prevista
              </span>
              <strong className="mt-1 block text-lg font-semibold text-blue-950">
                {formatTechnologyNumber(technologyPreview.storageCapacityKwh)} kWh
              </strong>
            </div>

            <div>
              <span className="block text-xs font-medium text-blue-700">
                Multiplicador da massa
              </span>
              <strong className="mt-1 block text-lg font-semibold text-blue-950">
                {formatTechnologyNumber(technologyPreview.massMultiplier, 3)}x
              </strong>
              <span className="mt-1 block text-xs font-medium text-blue-700">
                {technologyPreview.usesTechnologySpecificMass
                  ? "comparado a massa base"
                  : "usando massa base"}
              </span>
            </div>
          </div>
        </section>

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

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Disponibilidade operacional
              <input
                className={controlClass}
                type="number"
                step="any"
                min="0"
                max="1"
                {...register(`${fieldPrefix}.availability_factor`, {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors?.availability_factor?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Custo de reposicao
              <input
                className={controlClass}
                type="number"
                step="any"
                min="0"
                {...register(`${fieldPrefix}.replacement_cost`, {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
              <FieldError message={errors?.replacement_cost?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Ano da reposicao
              <input
                className={controlClass}
                type="number"
                step="1"
                min="1"
                {...register(`${fieldPrefix}.replacement_year`, {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
              <FieldError message={errors?.replacement_year?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Custo de fim de vida
              <input
                className={controlClass}
                type="number"
                step="any"
                min="0"
                {...register(`${fieldPrefix}.end_of_life_cost`, {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
              <FieldError message={errors?.end_of_life_cost?.message} />
            </label>
          </div>
        </FormGroup>
      </div>
    </article>
  );
}
