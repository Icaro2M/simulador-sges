import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { SimulationRequest } from "../../types/simulation";
import { Field } from "../ui/Field";
import { SectionCard } from "../ui/SectionCard";

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

export function ComparisonScenarioForm({
  index,
  register,
  errors,
  canRemove,
  onRemove,
}: Props) {
  const title = `Cenário ${index + 1}`;

  return (
    <div className="comparison-scenario-card">
      <div className="scenario-card-header">
        <h2>{title}</h2>

        {canRemove && (
          <button type="button" className="secondary-button" onClick={onRemove}>
            Remover cenário
          </button>
        )}
      </div>

      <SectionCard
        title="Identificação"
        description="Dados gerais do cenário comparado."
      >
        <Field label="Nome do cenário" error={errors?.name?.message}>
          <input {...register(`scenarios.${index}.name`)} />
        </Field>

        <Field label="Tecnologia" error={errors?.technology_type?.message}>
          <select {...register(`scenarios.${index}.technology_type`)}>
            <option value="tower">Tower</option>
            <option value="shaft">Shaft</option>
          </select>
        </Field>
      </SectionCard>

      <SectionCard
        title="Parâmetros físicos"
        description="Base física para energia armazenada e potência."
      >
        <Field label="Massa (kg)" error={errors?.mass_kg?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.mass_kg`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Altura (m)" error={errors?.height_m?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.height_m`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Potência nominal (kW)"
          error={errors?.nominal_power_kw?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.nominal_power_kw`, {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Eficiências"
        description="Eficiências de conversão e perdas internas."
      >
        <Field label="Motor" error={errors?.motor_efficiency?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.motor_efficiency`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Gerador" error={errors?.generator_efficiency?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.generator_efficiency`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Mecânica" error={errors?.mechanical_efficiency?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.mechanical_efficiency`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Auxiliar" error={errors?.auxiliary_efficiency?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.auxiliary_efficiency`, {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Perdas"
        description="Perdas por ciclo, fixas e em standby."
      >
        <Field
          label="Perda por ciclo"
          error={errors?.cycle_loss_fraction?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.cycle_loss_fraction`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Perda fixa por ciclo (kWh)"
          error={errors?.fixed_cycle_loss_kwh?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.fixed_cycle_loss_kwh`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Perda standby (kWh/h)"
          error={errors?.standby_loss_kwh_per_hour?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.standby_loss_kwh_per_hour`, {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Economia"
        description="Parâmetros econômicos para CAPEX, OPEX e LCOS."
      >
        <Field label="Custo por kW" error={errors?.cost_per_kw?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.cost_per_kw`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Custo por kWh" error={errors?.cost_per_kwh?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.cost_per_kwh`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="CAPEX fixo" error={errors?.fixed_capex?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.fixed_capex`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="OPEX anual fixo"
          error={errors?.fixed_annual_opex?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.fixed_annual_opex`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="OPEX variável por MWh"
          error={errors?.variable_opex_per_mwh?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.variable_opex_per_mwh`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Vida útil (anos)"
          error={errors?.project_lifetime_years?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.project_lifetime_years`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field
          label="Taxa de desconto"
          error={errors?.discount_rate?.message}
        >
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.discount_rate`, {
              valueAsNumber: true,
            })}
          />
        </Field>

        <Field label="Ciclos por ano" error={errors?.cycles_per_year?.message}>
          <input
            type="number"
            step="any"
            {...register(`scenarios.${index}.cycles_per_year`, {
              valueAsNumber: true,
            })}
          />
        </Field>
      </SectionCard>
    </div>
  );
}