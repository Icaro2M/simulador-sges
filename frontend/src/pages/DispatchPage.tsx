import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { DispatchChart } from "../components/charts/DispatchChart";
import { DispatchPriceProfileForm } from "../components/forms/DispatchPriceProfileForm";
import { DispatchSummary } from "../components/results/DispatchSummary";
import { DispatchTable } from "../components/results/DispatchTable";
import { PageContainer } from "../components/ui/PageContainer";
import { useDispatch } from "../hooks/useDispatch";
import type { DispatchPricePoint, DispatchRequest } from "../types/dispatch";
import type { SimulationRequest, TechnologyType } from "../types/simulation";
import {
  exportDispatchToCsv,
  exportDispatchToJson,
} from "../utils/exportDispatch";

const defaultScenario: SimulationRequest = {
  name: "Dispatch Scenario",

  technology_type: "tower",

  mass_kg: 100000,
  height_m: 100,
  nominal_power_kw: 500,
  charge_power_kw: 500,
  discharge_power_kw: 500,

  charge_efficiency: 0.9,
  discharge_efficiency: 0.9,

  cycle_loss_fraction: 0.02,
  fixed_cycle_loss_kwh: 5,
  standby_loss_kwh_per_hour: 0.5,

  cost_per_kw: 1200,
  cost_per_kwh: 300,
  fixed_capex: 100000,
  fixed_annual_opex: 10000,
  variable_opex_per_mwh: 5,
  charging_energy_cost_per_mwh: 0,

  project_lifetime_years: 25,
  discount_rate: 0.08,
  cycles_per_year: 300,
  availability_factor: 1,
};

const defaultPriceProfile: DispatchPricePoint[] = [
  { hour: 0, price: 120 },
  { hour: 1, price: 110 },
  { hour: 2, price: 95 },
  { hour: 3, price: 80 },
  { hour: 4, price: 75 },
  { hour: 5, price: 90 },
  { hour: 6, price: 140 },
  { hour: 7, price: 180 },
  { hour: 8, price: 220 },
  { hour: 9, price: 210 },
  { hour: 10, price: 160 },
  { hour: 11, price: 130 },
];

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60";

function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}

export function DispatchPage() {
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const { data, loading, error, executeDispatch } = useDispatch();

  const [scenario, setScenario] = useState<SimulationRequest>(defaultScenario);

  const [priceProfile, setPriceProfile] =
    useState<DispatchPricePoint[]>(defaultPriceProfile);

  const [lowPriceThreshold, setLowPriceThreshold] = useState(90);
  const [highPriceThreshold, setHighPriceThreshold] = useState(180);
  const [initialSocKwh, setInitialSocKwh] = useState(0);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [data]);

  function updateScenarioField<K extends keyof SimulationRequest>(
    field: K,
    value: SimulationRequest[K]
  ) {
    setScenario((currentScenario) => ({
      ...currentScenario,
      [field]: value,
    }));
  }

  function validateDispatchInput() {
    if (!scenario.name.trim()) {
      setValidationError("O nome do cenário é obrigatório.");
      return false;
    }

    if (scenario.mass_kg <= 0) {
      setValidationError("A massa precisa ser maior que zero.");
      return false;
    }

    if (scenario.height_m <= 0) {
      setValidationError("A altura precisa ser maior que zero.");
      return false;
    }

    if (scenario.charge_power_kw <= 0) {
      setValidationError("A potência de carga precisa ser maior que zero.");
      return false;
    }

    if (scenario.discharge_power_kw <= 0) {
      setValidationError("A potência de descarga precisa ser maior que zero.");
      return false;
    }

    if (scenario.charge_efficiency <= 0 || scenario.charge_efficiency > 1) {
      setValidationError("A eficiência de carga precisa estar entre 0 e 1.");
      return false;
    }

    if (scenario.discharge_efficiency <= 0 || scenario.discharge_efficiency > 1) {
      setValidationError("A eficiência de descarga precisa estar entre 0 e 1.");
      return false;
    }

    if (scenario.charging_energy_cost_per_mwh < 0) {
      setValidationError("O custo da energia de carga nao pode ser negativo.");
      return false;
    }

    if (scenario.availability_factor < 0 || scenario.availability_factor > 1) {
      setValidationError("A disponibilidade operacional precisa estar entre 0 e 1.");
      return false;
    }

    if (priceProfile.length === 0) {
      setValidationError("O perfil de preços precisa ter pelo menos um ponto.");
      return false;
    }

    const hasInvalidPricePoint = priceProfile.some(
      (point) => !Number.isFinite(point.hour) || !Number.isFinite(point.price)
    );

    if (hasInvalidPricePoint) {
      setValidationError("Todas as horas e preços precisam ser números válidos.");
      return false;
    }

    if (lowPriceThreshold >= highPriceThreshold) {
      setValidationError(
        "O limite de preço baixo precisa ser menor que o limite de preço alto."
      );
      return false;
    }

    if (initialSocKwh < 0) {
      setValidationError("O SOC inicial não pode ser negativo.");
      return false;
    }

    setValidationError(null);
    return true;
  }

  function handleRunDispatch() {
    if (!validateDispatchInput()) {
      return;
    }

    const sortedPriceProfile = [...priceProfile].sort(
      (a, b) => a.hour - b.hour
    );

    const request: DispatchRequest = {
      scenario,
      price_profile: sortedPriceProfile,
      low_price_threshold: lowPriceThreshold,
      high_price_threshold: highPriceThreshold,
      initial_soc_kwh: initialSocKwh,
    };

    executeDispatch(request);
  }

  function resetScenario() {
    setScenario(defaultScenario);
  }

  function resetPriceProfile() {
    setPriceProfile(defaultPriceProfile);
  }

  return (
    <PageContainer
      title="Dispatch"
      subtitle="Análise temporal de carga, descarga e arbitragem energética para um cenário SGES."
    >
      <div className="space-y-8">
        <div className="flex justify-end">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={handleRunDispatch}
            disabled={loading}
          >
            {loading ? "Executando..." : "Executar dispatch"}
          </button>
        </div>

        <FormSection
          title="Cenário SGES"
          description="Configure o cenário técnico-econômico enviado ao backend para a análise de dispatch."
          action={
            <button className={secondaryButtonClass} type="button" onClick={resetScenario}>
              Resetar cenário
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field label="Nome do cenário">
              <input
                className={inputClass}
                type="text"
                value={scenario.name}
                onChange={(event) =>
                  updateScenarioField("name", event.target.value)
                }
              />
            </Field>

            <Field label="Tecnologia">
              <select
                className={inputClass}
                value={scenario.technology_type}
                onChange={(event) =>
                  updateScenarioField(
                    "technology_type",
                    event.target.value as TechnologyType
                  )
                }
              >
                <option value="tower">Tower</option>
                <option value="shaft">Shaft</option>
              </select>
            </Field>

            <Field label="Massa kg">
              <input
                className={inputClass}
                type="number"
                value={scenario.mass_kg}
                onChange={(event) =>
                  updateScenarioField("mass_kg", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Altura m">
              <input
                className={inputClass}
                type="number"
                value={scenario.height_m}
                onChange={(event) =>
                  updateScenarioField("height_m", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Potência nominal kW">
              <input
                className={inputClass}
                type="number"
                value={scenario.nominal_power_kw}
                onChange={(event) =>
                  updateScenarioField(
                    "nominal_power_kw",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Potência de carga kW">
              <input
                className={inputClass}
                type="number"
                value={scenario.charge_power_kw}
                onChange={(event) =>
                  updateScenarioField(
                    "charge_power_kw",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Potência de descarga kW">
              <input
                className={inputClass}
                type="number"
                value={scenario.discharge_power_kw}
                onChange={(event) =>
                  updateScenarioField(
                    "discharge_power_kw",
                    Number(event.target.value)
                  )
                }
              />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Eficiências e perdas">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Eficiência de carga">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={scenario.charge_efficiency}
                onChange={(event) =>
                  updateScenarioField(
                    "charge_efficiency",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Eficiência de descarga">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={scenario.discharge_efficiency}
                onChange={(event) =>
                  updateScenarioField(
                    "discharge_efficiency",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Perda por ciclo">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={scenario.cycle_loss_fraction}
                onChange={(event) =>
                  updateScenarioField(
                    "cycle_loss_fraction",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Perda fixa por ciclo kWh">
              <input
                className={inputClass}
                type="number"
                value={scenario.fixed_cycle_loss_kwh}
                onChange={(event) =>
                  updateScenarioField(
                    "fixed_cycle_loss_kwh",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Perda standby kWh/h">
              <input
                className={inputClass}
                type="number"
                value={scenario.standby_loss_kwh_per_hour}
                onChange={(event) =>
                  updateScenarioField(
                    "standby_loss_kwh_per_hour",
                    Number(event.target.value)
                  )
                }
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Economia">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Custo por kW">
              <input
                className={inputClass}
                type="number"
                value={scenario.cost_per_kw}
                onChange={(event) =>
                  updateScenarioField("cost_per_kw", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Custo por kWh">
              <input
                className={inputClass}
                type="number"
                value={scenario.cost_per_kwh}
                onChange={(event) =>
                  updateScenarioField("cost_per_kwh", Number(event.target.value))
                }
              />
            </Field>

            <Field label="CAPEX fixo">
              <input
                className={inputClass}
                type="number"
                value={scenario.fixed_capex}
                onChange={(event) =>
                  updateScenarioField("fixed_capex", Number(event.target.value))
                }
              />
            </Field>

            <Field label="OPEX anual fixo">
              <input
                className={inputClass}
                type="number"
                value={scenario.fixed_annual_opex}
                onChange={(event) =>
                  updateScenarioField(
                    "fixed_annual_opex",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="OPEX variável por MWh">
              <input
                className={inputClass}
                type="number"
                value={scenario.variable_opex_per_mwh}
                onChange={(event) =>
                  updateScenarioField(
                    "variable_opex_per_mwh",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Custo da energia de carga por MWh">
              <input
                className={inputClass}
                type="number"
                value={scenario.charging_energy_cost_per_mwh}
                onChange={(event) =>
                  updateScenarioField(
                    "charging_energy_cost_per_mwh",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Vida útil anos">
              <input
                className={inputClass}
                type="number"
                value={scenario.project_lifetime_years}
                onChange={(event) =>
                  updateScenarioField(
                    "project_lifetime_years",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Taxa de desconto">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={scenario.discount_rate}
                onChange={(event) =>
                  updateScenarioField("discount_rate", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Ciclos por ano">
              <input
                className={inputClass}
                type="number"
                value={scenario.cycles_per_year}
                onChange={(event) =>
                  updateScenarioField(
                    "cycles_per_year",
                    Number(event.target.value)
                  )
                }
              />
            </Field>

            <Field label="Disponibilidade operacional">
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min={0}
                max={1}
                value={scenario.availability_factor}
                onChange={(event) =>
                  updateScenarioField(
                    "availability_factor",
                    Number(event.target.value)
                  )
                }
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Parâmetros de dispatch"
          description="Configure os limites de preço usados pelo backend para decidir os momentos de carga e descarga."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Limite de preço baixo">
              <input
                className={inputClass}
                type="number"
                value={lowPriceThreshold}
                onChange={(event) =>
                  setLowPriceThreshold(Number(event.target.value))
                }
              />
            </Field>

            <Field label="Limite de preço alto">
              <input
                className={inputClass}
                type="number"
                value={highPriceThreshold}
                onChange={(event) =>
                  setHighPriceThreshold(Number(event.target.value))
                }
              />
            </Field>

            <Field label="SOC inicial kWh">
              <input
                className={inputClass}
                type="number"
                min={0}
                value={initialSocKwh}
                onChange={(event) => setInitialSocKwh(Number(event.target.value))}
              />
            </Field>
          </div>
        </FormSection>

        <DispatchPriceProfileForm
          value={priceProfile}
          onChange={setPriceProfile}
          onReset={resetPriceProfile}
        />

        {validationError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {validationError}
          </p>
        )}

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {data && data.results.length > 0 && (
          <div className="space-y-6 scroll-mt-6" ref={resultsRef}>
            <DispatchSummary data={data.results} summary={data.summary} />

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Exportação
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Baixe os resultados temporais do dispatch em CSV ou JSON.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={() => exportDispatchToCsv(data.results)}
                  >
                    Exportar CSV
                  </button>

                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={() => exportDispatchToJson(data.results)}
                  >
                    Exportar JSON
                  </button>
                </div>
              </div>
            </section>

            <DispatchChart data={data.results} />
            <DispatchTable data={data.results} />
          </div>
        )}

        {data && data.results.length === 0 && (
          <section
            className="scroll-mt-6 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
            ref={resultsRef}
          >
            Nenhum resultado retornado pelo dispatch.
          </section>
        )}
      </div>
    </PageContainer>
  );
}
