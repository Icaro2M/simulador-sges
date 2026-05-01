import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { SensitivityRequest } from "../../types/analysis";

interface Props {
  register: UseFormRegister<SensitivityRequest>;
  errors: FieldErrors<SensitivityRequest>;
}

const controlClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-medium text-red-600">{message}</span>;
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

export function SensitivityForm({ register, errors }: Props) {
  return (
    <div className="grid gap-6">
      <FormSection
        title="Configuração da sensibilidade"
        description="Defina qual parâmetro será variado e o intervalo analisado."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Parâmetro analisado
            <select className={controlClass} {...register("parameter_path")}>
              <option value="technology.height_m">Altura</option>
              <option value="technology.mass_kg">Massa</option>
              <option value="technology.nominal_power_kw">Potência nominal</option>

              <option value="economics.cost_per_kw">Custo por kW</option>
              <option value="economics.cost_per_kwh">Custo por kWh</option>
              <option value="economics.fixed_capex">CAPEX fixo</option>
              <option value="economics.fixed_annual_opex">
                OPEX anual fixo
              </option>
              <option value="economics.variable_opex_per_mwh">
                OPEX variável por MWh
              </option>

              <option value="losses.cycle_loss_fraction">Perda por ciclo</option>
              <option value="losses.fixed_cycle_loss_kwh">
                Perda fixa por ciclo
              </option>
              <option value="losses.standby_loss_kwh_per_hour">
                Perda standby
              </option>
            </select>
            <FieldError message={errors.parameter_path?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Valor mínimo
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("min_val", { valueAsNumber: true })}
            />
            <FieldError message={errors.min_val?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Valor máximo
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("max_val", { valueAsNumber: true })}
            />
            <FieldError message={errors.max_val?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Quantidade de passos
            <input
              className={controlClass}
              type="number"
              step="1"
              {...register("steps", { valueAsNumber: true })}
            />
            <FieldError message={errors.steps?.message} />
          </label>
        </div>
      </FormSection>

      <FormSection
        title="Cenário base"
        description="Cenário usado como referência para a análise."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Nome do cenário
            <input className={controlClass} {...register("base_scenario.name")} />
            <FieldError message={errors.base_scenario?.name?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Tecnologia
            <select
              className={controlClass}
              {...register("base_scenario.technology_type")}
            >
              <option value="tower">Tower</option>
              <option value="shaft">Shaft</option>
            </select>
            <FieldError message={errors.base_scenario?.technology_type?.message} />
          </label>
        </div>
      </FormSection>

      <FormSection
        title="Parâmetros físicos"
        description="Base física para o cálculo energético."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Massa (kg)
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.mass_kg", { valueAsNumber: true })}
            />
            <FieldError message={errors.base_scenario?.mass_kg?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Altura (m)
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.height_m", { valueAsNumber: true })}
            />
            <FieldError message={errors.base_scenario?.height_m?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Potência nominal (kW)
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.nominal_power_kw", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.nominal_power_kw?.message}
            />
          </label>
        </div>
      </FormSection>

      <FormSection
        title="Eficiências"
        description="Eficiências de conversão e recuperação."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Motor
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.motor_efficiency", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.motor_efficiency?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Gerador
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.generator_efficiency", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.generator_efficiency?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Mecânica
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.mechanical_efficiency", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.mechanical_efficiency?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Auxiliar
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.auxiliary_efficiency", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.auxiliary_efficiency?.message}
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Perdas" description="Perdas fixas, por ciclo e em standby.">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Perda por ciclo
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.cycle_loss_fraction", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.cycle_loss_fraction?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Perda fixa por ciclo (kWh)
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.fixed_cycle_loss_kwh", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.fixed_cycle_loss_kwh?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Perda standby (kWh/h)
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.standby_loss_kwh_per_hour", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.standby_loss_kwh_per_hour?.message}
            />
          </label>
        </div>
      </FormSection>

      <FormSection
        title="Economia"
        description="Parâmetros para CAPEX, OPEX e LCOS."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Custo por kW
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.cost_per_kw", {
                valueAsNumber: true,
              })}
            />
            <FieldError message={errors.base_scenario?.cost_per_kw?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Custo por kWh
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.cost_per_kwh", {
                valueAsNumber: true,
              })}
            />
            <FieldError message={errors.base_scenario?.cost_per_kwh?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            CAPEX fixo
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.fixed_capex", {
                valueAsNumber: true,
              })}
            />
            <FieldError message={errors.base_scenario?.fixed_capex?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            OPEX anual fixo
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.fixed_annual_opex", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.fixed_annual_opex?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            OPEX variável por MWh
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.variable_opex_per_mwh", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.variable_opex_per_mwh?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Vida útil (anos)
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.project_lifetime_years", {
                valueAsNumber: true,
              })}
            />
            <FieldError
              message={errors.base_scenario?.project_lifetime_years?.message}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Taxa de desconto
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.discount_rate", {
                valueAsNumber: true,
              })}
            />
            <FieldError message={errors.base_scenario?.discount_rate?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Ciclos por ano
            <input
              className={controlClass}
              type="number"
              step="any"
              {...register("base_scenario.cycles_per_year", {
                valueAsNumber: true,
              })}
            />
            <FieldError message={errors.base_scenario?.cycles_per_year?.message} />
          </label>
        </div>
      </FormSection>
    </div>
  );
}
