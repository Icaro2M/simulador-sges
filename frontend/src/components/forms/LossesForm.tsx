import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SimulationRequest } from "../../types/simulation";
import { Field } from "../ui/Field";
import { SectionCard } from "../ui/SectionCard";

interface Props {
  register: UseFormRegister<SimulationRequest>;
  errors: FieldErrors<SimulationRequest>;
}

export function LossesForm({ register, errors }: Props) {
  return (
    <SectionCard title="Perdas" description="Perdas fixas, por ciclo e em standby.">
      <Field label="Perda por ciclo" error={errors.cycle_loss_fraction?.message}>
        <input type="number" step="any" {...register("cycle_loss_fraction", { valueAsNumber: true })} />
      </Field>

      <Field label="Perda fixa por ciclo (kWh)" error={errors.fixed_cycle_loss_kwh?.message}>
        <input type="number" step="any" {...register("fixed_cycle_loss_kwh", { valueAsNumber: true })} />
      </Field>

      <Field label="Perda standby (kWh/h)" error={errors.standby_loss_kwh_per_hour?.message}>
        <input type="number" step="any" {...register("standby_loss_kwh_per_hour", { valueAsNumber: true })} />
      </Field>
    </SectionCard>
  );
}