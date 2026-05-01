import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SimulationRequest } from "../../types/simulation";
import { Field } from "../ui/Field";
import { SectionCard } from "../ui/SectionCard";

interface Props {
  register: UseFormRegister<SimulationRequest>;
  errors: FieldErrors<SimulationRequest>;
}

export function EconomicsForm({ register, errors }: Props) {
  return (
    <SectionCard title="Economia" description="Parâmetros para CAPEX, OPEX e LCOS.">
      <Field label="Custo por kW" error={errors.cost_per_kw?.message}>
        <input type="number" step="any" {...register("cost_per_kw", { valueAsNumber: true })} />
      </Field>

      <Field label="Custo por kWh" error={errors.cost_per_kwh?.message}>
        <input type="number" step="any" {...register("cost_per_kwh", { valueAsNumber: true })} />
      </Field>

      <Field label="CAPEX fixo" error={errors.fixed_capex?.message}>
        <input type="number" step="any" {...register("fixed_capex", { valueAsNumber: true })} />
      </Field>

      <Field label="OPEX anual fixo" error={errors.fixed_annual_opex?.message}>
        <input type="number" step="any" {...register("fixed_annual_opex", { valueAsNumber: true })} />
      </Field>

      <Field label="OPEX variável por MWh" error={errors.variable_opex_per_mwh?.message}>
        <input type="number" step="any" {...register("variable_opex_per_mwh", { valueAsNumber: true })} />
      </Field>

      <Field label="Vida útil (anos)" error={errors.project_lifetime_years?.message}>
        <input type="number" step="any" {...register("project_lifetime_years", { valueAsNumber: true })} />
      </Field>

      <Field label="Taxa de desconto" error={errors.discount_rate?.message}>
        <input type="number" step="any" {...register("discount_rate", { valueAsNumber: true })} />
      </Field>

      <Field label="Ciclos por ano" error={errors.cycles_per_year?.message}>
        <input type="number" step="any" {...register("cycles_per_year", { valueAsNumber: true })} />
      </Field>
    </SectionCard>
  );
}