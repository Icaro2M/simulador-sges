import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { SensitivityRequest } from "../../types/analysis";
import { Field } from "../ui/Field";
import { SectionCard } from "../ui/SectionCard";

interface Props {
  register: UseFormRegister<SensitivityRequest>;
  errors: FieldErrors<SensitivityRequest>;
}

export function SensitivityForm({ register, errors }: Props) {
  return (
    <>
      <SectionCard
        title="Configuração da sensibilidade"
        description="Defina qual parâmetro será variado e o intervalo analisado."
      >
        <Field label="Parâmetro analisado" error={errors.parameter_path?.message}>
          <select {...register("parameter_path")}>
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
        </Field>

        <Field label="Valor mínimo" error={errors.min_val?.message}>
          <input
            type="number"
            step="any"
            {...register("min_val", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Valor máximo" error={errors.max_val?.message}>
          <input
            type="number"
            step="any"
            {...register("max_val", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Quantidade de passos" error={errors.steps?.message}>
          <input
            type="number"
            step="1"
            {...register("steps", { valueAsNumber: true })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Cenário base"
        description="Cenário usado como referência para a análise."
      >
        <Field
          label="Nome do cenário"
          error={errors.base_scenario?.name?.message}
        >
          <input {...register("base_scenario.name")} />
        </Field>

        <Field
          label="Tecnologia"
          error={errors.base_scenario?.technology_type?.message}
        >
          <select {...register("base_scenario.technology_type")}>
            <option value="tower">Tower</option>
            <option value="shaft">Shaft</option>
          </select>
        </Field>
      </SectionCard>

      <SectionCard
        title="Parâmetros físicos"
        description="Base física para o cálculo energético."
      >
        <Field label="Massa (kg)" error={errors.base_scenario?.mass_kg?.message}>
          <input
            type="number"
            step="any"
            {...register("base_scenario.mass_kg", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Altura (m)" error={errors.base_scenario?.height_m?.message}>
          <input
            type="number"
            step="any"
            {...register("base_scenario.height_m", { valueAsNumber: true })}
          />
        </Field>

        <Field
          label="Potência nominal (kW)"
          error={errors.base_scenario?.nominal_power_kw?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.nominal_power_kw", {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Eficiências"
        description="Eficiências de conversão e recuperação."
      >
        <Field
          label="Motor"
          error={errors.base_scenario?.motor_efficiency?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.motor_efficiency", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Gerador"
          error={errors.base_scenario?.generator_efficiency?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.generator_efficiency", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Mecânica"
          error={errors.base_scenario?.mechanical_efficiency?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.mechanical_efficiency", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Auxiliar"
          error={errors.base_scenario?.auxiliary_efficiency?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.auxiliary_efficiency", {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Perdas"
        description="Perdas fixas, por ciclo e em standby."
      >
        <Field
          label="Perda por ciclo"
          error={errors.base_scenario?.cycle_loss_fraction?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.cycle_loss_fraction", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Perda fixa por ciclo (kWh)"
          error={errors.base_scenario?.fixed_cycle_loss_kwh?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.fixed_cycle_loss_kwh", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Perda standby (kWh/h)"
          error={errors.base_scenario?.standby_loss_kwh_per_hour?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.standby_loss_kwh_per_hour", {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Economia"
        description="Parâmetros para CAPEX, OPEX e LCOS."
      >
        <Field
          label="Custo por kW"
          error={errors.base_scenario?.cost_per_kw?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.cost_per_kw", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Custo por kWh"
          error={errors.base_scenario?.cost_per_kwh?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.cost_per_kwh", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="CAPEX fixo"
          error={errors.base_scenario?.fixed_capex?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.fixed_capex", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="OPEX anual fixo"
          error={errors.base_scenario?.fixed_annual_opex?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.fixed_annual_opex", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="OPEX variável por MWh"
          error={errors.base_scenario?.variable_opex_per_mwh?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.variable_opex_per_mwh", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Vida útil (anos)"
          error={errors.base_scenario?.project_lifetime_years?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.project_lifetime_years", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Taxa de desconto"
          error={errors.base_scenario?.discount_rate?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.discount_rate", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Ciclos por ano"
          error={errors.base_scenario?.cycles_per_year?.message}
        >
          <input
            type="number"
            step="any"
            {...register("base_scenario.cycles_per_year", {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>
    </>
  );
}