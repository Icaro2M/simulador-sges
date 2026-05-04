import type { SimulationRequest } from "../types/simulation";

const STANDARD_GRAVITY = 9.80665;
const JOULES_PER_KWH = 3_600_000;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeOptionalNumber(value: number | null | undefined) {
  return isFiniteNumber(value) ? value : undefined;
}

export function buildTechnologyScenarioPayload(
  scenario: SimulationRequest
): SimulationRequest {
  const blockCount = normalizeOptionalNumber(scenario.block_count);
  const massPerBlockKg = normalizeOptionalNumber(scenario.mass_per_block_kg);
  const materialDensityKgM3 = normalizeOptionalNumber(
    scenario.material_density_kg_m3
  );
  const containerVolumeM3 = normalizeOptionalNumber(scenario.container_volume_m3);

  return {
    ...scenario,
    block_count:
      scenario.technology_type === "tower" && blockCount !== undefined
        ? Math.trunc(blockCount)
        : undefined,
    mass_per_block_kg:
      scenario.technology_type === "tower" ? massPerBlockKg : undefined,
    usable_height_fraction:
      scenario.technology_type === "tower"
        ? scenario.usable_height_fraction ?? 1
        : 1,
    structure_cost_per_meter:
      scenario.technology_type === "tower"
        ? scenario.structure_cost_per_meter ?? 0
        : 0,
    usable_depth_fraction:
      scenario.technology_type === "shaft"
        ? scenario.usable_depth_fraction ?? 1
        : 1,
    shaft_rehabilitation_cost:
      scenario.technology_type === "shaft"
        ? scenario.shaft_rehabilitation_cost ?? 0
        : 0,
    material_density_kg_m3:
      scenario.technology_type === "shaft" ? materialDensityKgM3 : undefined,
    container_volume_m3:
      scenario.technology_type === "shaft" ? containerVolumeM3 : undefined,
  };
}

export function calculateTechnologyPreview(scenario: SimulationRequest) {
  const payload = buildTechnologyScenarioPayload(scenario);
  const usesTowerBlocks =
    payload.technology_type === "tower" &&
    payload.block_count !== undefined &&
    payload.mass_per_block_kg !== undefined;
  const usesShaftVolume =
    payload.technology_type === "shaft" &&
    payload.material_density_kg_m3 !== undefined &&
    payload.container_volume_m3 !== undefined;

  const effectiveMassKg = usesTowerBlocks
    ? payload.block_count! * payload.mass_per_block_kg!
    : usesShaftVolume
      ? payload.material_density_kg_m3! * payload.container_volume_m3!
      : payload.mass_kg;
  const massMultiplier =
    payload.mass_kg > 0 ? effectiveMassKg / payload.mass_kg : 0;
  const massSourceDetail = usesTowerBlocks
    ? `${payload.block_count} x ${formatTechnologyNumber(
        payload.mass_per_block_kg!
      )} kg`
    : usesShaftVolume
      ? `${formatTechnologyNumber(
          payload.material_density_kg_m3!
        )} kg/m3 x ${formatTechnologyNumber(payload.container_volume_m3!)} m3`
      : "massa base";
  const usableDistanceM =
    payload.technology_type === "tower"
      ? payload.height_m * (payload.usable_height_fraction ?? 1)
      : payload.height_m * (payload.usable_depth_fraction ?? 1);
  const storageCapacityKwh =
    (effectiveMassKg * STANDARD_GRAVITY * usableDistanceM) / JOULES_PER_KWH;

  return {
    effectiveMassKg,
    massMultiplier,
    massSourceDetail,
    usableDistanceM,
    storageCapacityKwh,
    usesTechnologySpecificMass: usesTowerBlocks || usesShaftVolume,
    payload,
  };
}

export function formatTechnologyNumber(value: number, digits = 2) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
