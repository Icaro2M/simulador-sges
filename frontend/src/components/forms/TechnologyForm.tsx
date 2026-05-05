import { useWatch } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { SimulationRequest } from "../../types/simulation";
import {
  calculateTechnologyPreview,
  formatTechnologyNumber,
} from "../../utils/technologyModel";

interface Props {
  register: UseFormRegister<SimulationRequest>;
  control: Control<SimulationRequest>;
  errors: FieldErrors<SimulationRequest>;
}

const numberInputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-medium text-red-600">{message}</span>;
}

const optionalNumber = {
  setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
};

export function TechnologyForm({ register, control, errors }: Props) {
  const technologyType = useWatch({
    control,
    name: "technology_type",
  });
  const watchedScenario = useWatch({ control }) as SimulationRequest;
  const technologyPreview = calculateTechnologyPreview(watchedScenario);

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Parâmetros físicos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Base para o cálculo energético.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Massa base/fallback (kg)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("mass_kg", { valueAsNumber: true })}
            />
            <FieldError message={errors.mass_kg?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Altura/profundidade base (m)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("height_m", { valueAsNumber: true })}
            />
            <FieldError message={errors.height_m?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Potência nominal (kW)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("nominal_power_kw", { valueAsNumber: true })}
            />
            <FieldError message={errors.nominal_power_kw?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Potência de carga (kW)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("charge_power_kw", { valueAsNumber: true })}
            />
            <FieldError message={errors.charge_power_kw?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Potência de descarga (kW)
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("discharge_power_kw", { valueAsNumber: true })}
            />
            <FieldError message={errors.discharge_power_kw?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <span className="block text-sm font-medium text-blue-700">
              Massa efetiva prevista
            </span>
            <strong className="mt-1 block text-xl font-semibold text-blue-950">
              {formatTechnologyNumber(technologyPreview.effectiveMassKg)} kg
            </strong>
            <span className="mt-1 block text-xs font-medium text-blue-700">
              {technologyPreview.massSourceDetail}
            </span>
          </div>

          <div>
            <span className="block text-sm font-medium text-blue-700">
              {technologyType === "tower"
                ? "Altura util prevista"
                : "Profundidade util prevista"}
            </span>
            <strong className="mt-1 block text-xl font-semibold text-blue-950">
              {formatTechnologyNumber(technologyPreview.usableDistanceM)} m
            </strong>
          </div>

          <div>
            <span className="block text-sm font-medium text-blue-700">
              Capacidade fisica prevista
            </span>
            <strong className="mt-1 block text-xl font-semibold text-blue-950">
              {formatTechnologyNumber(technologyPreview.storageCapacityKwh)} kWh
            </strong>
          </div>

          <div>
            <span className="block text-sm font-medium text-blue-700">
              Multiplicador da massa
            </span>
            <strong className="mt-1 block text-xl font-semibold text-blue-950">
              {formatTechnologyNumber(technologyPreview.massMultiplier, 3)}x
            </strong>
            <span className="mt-1 block text-xs font-medium text-blue-700">
              {technologyPreview.usesTechnologySpecificMass
                ? "comparado a massa base"
                : "usando massa base"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Modelo especifico da tecnologia
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Parametros opcionais para diferenciar torre e poco/mina.
          </p>
        </div>

        {technologyType === "tower" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Quantidade de blocos
              <input
                className={numberInputClass}
                type="number"
                min={1}
                {...register("block_count", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
              />
              <FieldError message={errors.block_count?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Massa por bloco kg
              <input
                className={numberInputClass}
                type="number"
                step="any"
                min={0}
                {...register("mass_per_block_kg", optionalNumber)}
              />
              <FieldError message={errors.mass_per_block_kg?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Fracao de altura util
              <input
                className={numberInputClass}
                type="number"
                step="0.01"
                min={0}
                max={1}
                {...register("usable_height_fraction", { valueAsNumber: true })}
              />
              <FieldError message={errors.usable_height_fraction?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Custo estrutural por metro
              <input
                className={numberInputClass}
                type="number"
                step="any"
                min={0}
                {...register("structure_cost_per_meter", { valueAsNumber: true })}
              />
              <FieldError message={errors.structure_cost_per_meter?.message} />
            </label>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Fracao de profundidade util
              <input
                className={numberInputClass}
                type="number"
                step="0.01"
                min={0}
                max={1}
                {...register("usable_depth_fraction", { valueAsNumber: true })}
              />
              <FieldError message={errors.usable_depth_fraction?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Custo de reabilitacao do poco
              <input
                className={numberInputClass}
                type="number"
                step="any"
                min={0}
                {...register("shaft_rehabilitation_cost", {
                  valueAsNumber: true,
                })}
              />
              <FieldError message={errors.shaft_rehabilitation_cost?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Densidade do material kg/m3
              <input
                className={numberInputClass}
                type="number"
                step="any"
                min={0}
                {...register("material_density_kg_m3", optionalNumber)}
              />
              <FieldError message={errors.material_density_kg_m3?.message} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Volume do container m3
              <input
                className={numberInputClass}
                type="number"
                step="any"
                min={0}
                {...register("container_volume_m3", optionalNumber)}
              />
              <FieldError message={errors.container_volume_m3?.message} />
            </label>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">Eficiências</h2>
          <p className="mt-1 text-sm text-slate-500">
            Conversão, recuperação e perdas internas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Carga
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("charge_efficiency", { valueAsNumber: true })}
            />
            <FieldError message={errors.charge_efficiency?.message} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Descarga
            <input
              className={numberInputClass}
              type="number"
              step="any"
              {...register("discharge_efficiency", { valueAsNumber: true })}
            />
            <FieldError message={errors.discharge_efficiency?.message} />
          </label>
        </div>
      </section>
    </>
  );
}
