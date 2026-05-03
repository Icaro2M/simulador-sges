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
  charge_power_kw: 500,
  discharge_power_kw: 500,

  charge_efficiency: 0.9,
  discharge_efficiency: 0.9,

  cycle_loss_fraction: 0.02,
  fixed_cycle_loss_kwh: 0,
  standby_loss_kwh_per_hour: 0,

  cost_per_kw: 800,
  cost_per_kwh: 100,
  fixed_capex: 50000,
  fixed_annual_opex: 10000,
  variable_opex_per_mwh: 5,
  charging_energy_cost_per_mwh: 0,

  project_lifetime_years: 20,
  discount_rate: 0.08,
  cycles_per_year: 300,
  availability_factor: 1,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6">
        <ScenarioForm register={register} errors={errors} />
        <TechnologyForm register={register} errors={errors} />
        <LossesForm register={register} errors={errors} />
        <EconomicsForm register={register} errors={errors} />
      </div>

      <div className="flex justify-end pt-1">
        <button
          className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Executando simulação..." : "Executar simulação"}
        </button>
      </div>
    </form>
  );
}
