import { z } from "zod";

export const simulationSchema = z.object({
  name: z.string().min(1, "Informe o nome do cenario"),

  technology_type: z.enum(["tower", "shaft"]),

  mass_kg: z.number().positive("A massa deve ser maior que zero"),
  height_m: z.number().positive("A altura deve ser maior que zero"),
  nominal_power_kw: z.number().positive("A potencia deve ser maior que zero"),
  charge_power_kw: z.number().positive("A potencia de carga deve ser maior que zero"),
  discharge_power_kw: z.number().positive("A potencia de descarga deve ser maior que zero"),
  block_count: z.number().int().positive().nullable().optional(),
  mass_per_block_kg: z.number().positive().nullable().optional(),
  usable_height_fraction: z.number().gt(0).max(1).optional(),
  structure_cost_per_meter: z.number().min(0).optional(),
  usable_depth_fraction: z.number().gt(0).max(1).optional(),
  shaft_rehabilitation_cost: z.number().min(0).optional(),
  material_density_kg_m3: z.number().positive().nullable().optional(),
  container_volume_m3: z.number().positive().nullable().optional(),

  charge_efficiency: z.number().gt(0).max(1),
  discharge_efficiency: z.number().gt(0).max(1),

  cycle_loss_fraction: z.number().min(0).lt(1, "A perda fracionaria deve ser menor que 1"),
  fixed_cycle_loss_kwh: z.number().min(0),
  standby_loss_kwh_per_hour: z.number().min(0),

  cost_per_kw: z.number().min(0),
  cost_per_kwh: z.number().min(0),
  fixed_capex: z.number().min(0),
  fixed_annual_opex: z.number().min(0),
  variable_opex_per_mwh: z.number().min(0),
  charging_energy_cost_per_mwh: z.number().min(0),

  project_lifetime_years: z.number().positive(),
  discount_rate: z.number().min(0).max(1),
  cycles_per_year: z.number().positive(),
  availability_factor: z.number().min(0).max(1),
  replacement_cost: z.number().min(0).optional(),
  replacement_year: z
    .number()
    .positive()
    .nullable()
    .optional()
    .refine(
      (value) =>
        value === undefined || value === null || Number.isInteger(value),
      {
        message: "O ano de reposicao deve ser inteiro",
      }
    ),
  end_of_life_cost: z.number().min(0).optional(),
}).refine(
  (data) =>
    data.replacement_year === undefined ||
    data.replacement_year === null ||
    data.replacement_year <= data.project_lifetime_years,
  {
    message: "O ano de reposicao deve estar dentro da vida util",
    path: ["replacement_year"],
  }
).refine(
  (data) =>
    (data.block_count === undefined || data.block_count === null) ===
    (data.mass_per_block_kg === undefined || data.mass_per_block_kg === null),
  {
    message: "Informe quantidade de blocos e massa por bloco juntos",
    path: ["block_count"],
  }
).refine(
  (data) =>
    (
      data.material_density_kg_m3 === undefined ||
      data.material_density_kg_m3 === null
    ) ===
    (
      data.container_volume_m3 === undefined ||
      data.container_volume_m3 === null
    ),
  {
    message: "Informe densidade e volume juntos",
    path: ["material_density_kg_m3"],
  }
);
