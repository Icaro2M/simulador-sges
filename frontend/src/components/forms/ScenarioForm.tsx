import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SimulationRequest } from "../../types/simulation";
import { Field } from "../ui/Field";
import { SectionCard } from "../ui/SectionCard";

interface Props {
  register: UseFormRegister<SimulationRequest>;
  errors: FieldErrors<SimulationRequest>;
}

export function ScenarioForm({ register, errors }: Props) {
  return (
    <SectionCard title="Identificação" description="Dados gerais do cenário.">
      <Field label="Nome do cenário" error={errors.name?.message}>
        <input {...register("name")} />
      </Field>

      <Field label="Tecnologia" error={errors.technology_type?.message}>
        <select {...register("technology_type")}>
          <option value="tower">Tower</option>
          <option value="shaft">Shaft</option>
        </select>
      </Field>
    </SectionCard>
  );
}