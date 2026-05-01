import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SimulationRequest } from "../../types/simulation";
import { Field } from "../ui/Field";
import { SectionCard } from "../ui/SectionCard";

interface Props {
  register: UseFormRegister<SimulationRequest>;
  errors: FieldErrors<SimulationRequest>;
}

export function TechnologyForm({ register, errors }: Props) {
  return (
    <>
      <SectionCard title="Parâmetros físicos" description="Base para o cálculo energético.">
        <Field label="Massa (kg)" error={errors.mass_kg?.message}>
          <input type="number" step="any" {...register("mass_kg", { valueAsNumber: true })} />
        </Field>

        <Field label="Altura (m)" error={errors.height_m?.message}>
          <input type="number" step="any" {...register("height_m", { valueAsNumber: true })} />
        </Field>

        <Field label="Potência nominal (kW)" error={errors.nominal_power_kw?.message}>
          <input type="number" step="any" {...register("nominal_power_kw", { valueAsNumber: true })} />
        </Field>
      </SectionCard>

      <SectionCard title="Eficiências" description="Conversão, recuperação e perdas internas.">
        <Field label="Motor" error={errors.motor_efficiency?.message}>
          <input type="number" step="any" {...register("motor_efficiency", { valueAsNumber: true })} />
        </Field>

        <Field label="Gerador" error={errors.generator_efficiency?.message}>
          <input type="number" step="any" {...register("generator_efficiency", { valueAsNumber: true })} />
        </Field>

        <Field label="Mecânica" error={errors.mechanical_efficiency?.message}>
          <input type="number" step="any" {...register("mechanical_efficiency", { valueAsNumber: true })} />
        </Field>

        <Field label="Auxiliar" error={errors.auxiliary_efficiency?.message}>
          <input type="number" step="any" {...register("auxiliary_efficiency", { valueAsNumber: true })} />
        </Field>
      </SectionCard>
    </>
  );
}