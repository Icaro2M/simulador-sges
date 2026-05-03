export const monteCarloParameterOptions = [
  {
    path: "technology.height_m",
    label: "Altura (m)",
    defaultMin: 50,
    defaultMax: 300,
  },
  {
    path: "technology.mass_kg",
    label: "Massa (kg)",
    defaultMin: 5000,
    defaultMax: 20000,
  },
  {
    path: "technology.charge_power_kw",
    label: "Potência de carga (kW)",
    defaultMin: 250,
    defaultMax: 1000,
  },
  {
    path: "technology.discharge_power_kw",
    label: "Potência de descarga (kW)",
    defaultMin: 250,
    defaultMax: 1000,
  },
  {
    path: "technology.charge_efficiency",
    label: "Eficiência de carga",
    defaultMin: 0.85,
    defaultMax: 0.95,
  },
  {
    path: "technology.discharge_efficiency",
    label: "Eficiência de descarga",
    defaultMin: 0.85,
    defaultMax: 0.95,
  },
  {
    path: "economics.cost_per_kw",
    label: "Custo por kW",
    defaultMin: 500,
    defaultMax: 1500,
  },
  {
    path: "economics.discount_rate",
    label: "Taxa de desconto",
    defaultMin: 0.04,
    defaultMax: 0.14,
  },
  {
    path: "economics.availability_factor",
    label: "Disponibilidade operacional",
    defaultMin: 0.8,
    defaultMax: 1,
  },
  {
    path: "economics.replacement_cost",
    label: "Custo de reposicao",
    defaultMin: 0,
    defaultMax: 50000,
  },
  {
    path: "economics.end_of_life_cost",
    label: "Custo de fim de vida",
    defaultMin: 0,
    defaultMax: 30000,
  },
] as const;
