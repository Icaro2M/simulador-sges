import { z } from "zod";

export const simulationSchema = z.object({
  name: z.string().min(1, "Informe o nome do cenário"),

  technology_type: z.enum(["tower", "shaft"]),

  mass_kg: z.number().positive("A massa deve ser maior que zero"),
  height_m: z.number().positive("A altura deve ser maior que zero"),
  nominal_power_kw: z.number().positive("A potência deve ser maior que zero"),

  motor_efficiency: z.number().min(0).max(1),
  generator_efficiency: z.number().min(0).max(1),
  mechanical_efficiency: z.number().min(0).max(1),
  auxiliary_efficiency: z.number().min(0).max(1),

  cycle_loss_fraction: z.number().min(0).max(1),
  fixed_cycle_loss_kwh: z.number().min(0),
  standby_loss_kwh_per_hour: z.number().min(0),

  cost_per_kw: z.number().min(0),
  cost_per_kwh: z.number().min(0),
  fixed_capex: z.number().min(0),
  fixed_annual_opex: z.number().min(0),
  variable_opex_per_mwh: z.number().min(0),

  project_lifetime_years: z.number().positive(),
  discount_rate: z.number().min(0).max(1),
  cycles_per_year: z.number().positive(),
});