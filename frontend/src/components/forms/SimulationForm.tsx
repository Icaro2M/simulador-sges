import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SimulationRequest } from "../../types/simulation";
import { simulationSchema } from "../../utils/validators";

import { EconomicsForm } from "./EconomicsForm";
import { LossesForm } from "./LossesForm";
import { ScenarioForm } from "./ScenarioForm";
import { TechnologyForm } from "./TechnologyForm";

interface SimulationFormProps {
  onSubmit: (data: SimulationRequest) => void;
  isLoading?: boolean;
}

const defaultValues: SimulationRequest = {
  name: "Teste SGES Tower",
  technology_type: "tower",

  mass_kg: 10000,
  height_m: 100,
  nominal_power_kw: 500,

  motor_efficiency: 0.9,
  generator_efficiency: 0.9,
  mechanical_efficiency: 0.95,
  auxiliary_efficiency: 1,

  cycle_loss_fraction: 0.02,
  fixed_cycle_loss_kwh: 0,
  standby_loss_kwh_per_hour: 0,

  cost_per_kw: 800,
  cost_per_kwh: 100,
  fixed_capex: 50000,
  fixed_annual_opex: 10000,
  variable_opex_per_mwh: 5,

  project_lifetime_years: 20,
  discount_rate: 0.08,
  cycles_per_year: 300,
};

export function SimulationForm({
  onSubmit,
  isLoading = false,
}: SimulationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SimulationRequest>({
    defaultValues,
    resolver: zodResolver(simulationSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="simulation-form">
      <ScenarioForm register={register} errors={errors} />
      <TechnologyForm register={register} errors={errors} />
      <LossesForm register={register} errors={errors} />
      <EconomicsForm register={register} errors={errors} />

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? "Executando simulação..." : "Executar simulação"}
        </button>
      </div>
    </form>
  );
}