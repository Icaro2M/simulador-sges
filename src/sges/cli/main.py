from pathlib import Path
import csv

import typer
from rich.console import Console
from rich.table import Table

from sges.analysis.comparison import build_comparison_table
from sges.analysis.monte_carlo import run_monte_carlo
from sges.analysis.sensitivity import run_sensitivity
from sges.io.config_loader import load_scenario_from_yaml
from sges.io.csv_loader import load_time_series_csv
from sges.io.exporters import export_result_to_csv, export_result_to_json
from sges.physics.loss_model import LossModel
from sges.simulation.dispatcher import DispatchConfig, run_price_arbitrage_dispatch
from sges.simulation.simulator import SGESSimulator
from sges.simulation.batch import run_batch
from sges.analysis.plots import plot_sensitivity, plot_monte_carlo, plot_dispatch

app = typer.Typer()
console = Console()


def _format_lcos(value: float | None) -> str:
    if value is None:
        return "undefined"

    return f"${value:,.2f}/MWh"


@app.command()
def run(
    config: Path = Path("configs/tower_sges.yaml"),
    output: Path | None = None,
):
    scenario = load_scenario_from_yaml(config)
    result = SGESSimulator().run(scenario)

    _print_single_result(result)

    if output is not None:
        if output.suffix.lower() == ".json":
            export_result_to_json(result, output)
        elif output.suffix.lower() == ".csv":
            export_result_to_csv(result, output)
        else:
            raise typer.BadParameter("output must be a .json or .csv file")

        console.print(f"\nResult exported to: {output}")


@app.command()
def compare(
    configs: list[Path],
    output: Path | None = None,
):
    if len(configs) < 2:
        raise typer.BadParameter("compare requires at least two config files")

    simulator = SGESSimulator()
    results = [simulator.run(load_scenario_from_yaml(config)) for config in configs]
    rows = build_comparison_table(results)

    table = Table(title="Scenario Comparison")
    table.add_column("Rank")
    table.add_column("Scenario")
    table.add_column("Technology")
    table.add_column("Delivered Energy")
    table.add_column("RTE")
    table.add_column("CAPEX")
    table.add_column("Annual Energy")
    table.add_column("LCOS")

    for index, row in enumerate(rows, start=1):
        table.add_row(
            str(index),
            row.scenario_name,
            row.technology_name,
            f"{row.delivered_energy_kwh:,.2f} kWh",
            f"{row.round_trip_efficiency:.2%}",
            f"${row.initial_capex:,.2f}",
            f"{row.annual_discharged_energy_mwh:,.2f} MWh",
            _format_lcos(row.lcos_per_mwh),
        )

    console.print(table)

    if output is not None:
        _export_comparison_csv(rows, output)
        console.print(f"\nComparison exported to: {output}")


@app.command()
def sensitivity(
    config: Path = Path("configs/tower_sges.yaml"),
    parameter: str = "technology.height_m",
    min_val: float = 50,
    max_val: float = 500,
    steps: int = 5,
    output: Path | None = None,
):
    scenario = load_scenario_from_yaml(config)

    rows = run_sensitivity(
        base_scenario=scenario,
        parameter_path=parameter,
        min_val=min_val,
        max_val=max_val,
        steps=steps,
    )

    table = Table(title=f"Sensitivity Analysis: {parameter}")
    table.add_column("Value")
    table.add_column("LCOS")
    table.add_column("CAPEX")
    table.add_column("Annual Energy")

    for row in rows:
        table.add_row(
            f"{row['value']:.2f}",
            _format_lcos(row["lcos"]),
            f"${row['capex']:,.2f}",
            f"{row['annual_energy_mwh']:,.2f} MWh",
        )

    console.print(table)

    if output is not None:
        _export_sensitivity_csv(rows, output)
        console.print(f"\nSensitivity exported to: {output}")


@app.command()
def monte_carlo(
    config: Path = Path("configs/tower_sges.yaml"),
    iterations: int = 100,
    seed: int | None = 42,
    output: Path | None = None,
):
    scenario = load_scenario_from_yaml(config)

    parameter_ranges = {
        "technology.height_m": (50, 500),
        "technology.mass_kg": (300_000, 1_500_000),
        "technology.charge_power_kw": (300, 2500),
        "technology.discharge_power_kw": (300, 2500),
        "technology.charge_efficiency": (0.85, 0.95),
        "technology.discharge_efficiency": (0.85, 0.95),
        "economics.cost_per_kw": (700, 1800),
        "economics.cost_per_kwh": (40, 150),
        "economics.charging_energy_cost_per_mwh": (0, 100),
        "economics.cycles_per_year": (150, 500),
    }

    rows = run_monte_carlo(
        base_scenario=scenario,
        parameter_ranges=parameter_ranges,
        iterations=iterations,
        seed=seed,
    )

    rows_with_lcos = [row for row in rows if row["lcos"] is not None]
    best = min(rows_with_lcos, key=lambda row: row["lcos"]) if rows_with_lcos else None
    worst = max(rows_with_lcos, key=lambda row: row["lcos"]) if rows_with_lcos else None
    avg_lcos = (
        sum(row["lcos"] for row in rows_with_lcos) / len(rows_with_lcos)
        if rows_with_lcos
        else None
    )

    table = Table(title="Monte Carlo Analysis")
    table.add_column("Metric")
    table.add_column("Value")

    table.add_row("Iterations", str(iterations))
    table.add_row("Average LCOS", _format_lcos(avg_lcos))
    table.add_row("Best LCOS", _format_lcos(best["lcos"] if best is not None else None))
    table.add_row("Worst LCOS", _format_lcos(worst["lcos"] if worst is not None else None))
    if best is not None and worst is not None:
        table.add_row("Best annual energy", f"{best['annual_energy_mwh']:,.2f} MWh")
        table.add_row("Worst annual energy", f"{worst['annual_energy_mwh']:,.2f} MWh")

    console.print(table)

    if output is not None:
        _export_monte_carlo_csv(rows, output)
        console.print(f"\nMonte Carlo exported to: {output}")


@app.command()
def dispatch(
    config: Path = Path("configs/tower_sges.yaml"),
    prices: Path = Path("data/input/price_profile.csv"),
    low_price: float = 50,
    high_price: float = 100,
    output: Path | None = None,
):
    scenario = load_scenario_from_yaml(config)
    simulation_result = SGESSimulator().run(scenario)
    price_profile = load_time_series_csv(prices)

    loss_model = LossModel(
        cycle_loss_fraction=scenario.losses.cycle_loss_fraction,
        fixed_cycle_loss_kwh=scenario.losses.fixed_cycle_loss_kwh,
        standby_loss_kwh_per_hour=scenario.losses.standby_loss_kwh_per_hour,
    )

    dispatch_result = run_price_arbitrage_dispatch(
        simulation_result=simulation_result,
        price_profile=price_profile,
        config=DispatchConfig(
            low_price_threshold=low_price,
            high_price_threshold=high_price,
            loss_model=loss_model,
        ),
    )

    summary = dispatch_result.attrs.get("summary", {})

    table = Table(title="Dispatch Simulation")
    table.add_column("Metric")
    table.add_column("Value")

    table.add_row(
        "Total charged from grid",
        f"{summary.get('total_energy_charged_from_grid_kwh', 0):,.2f} kWh",
    )
    table.add_row(
        "Total stored",
        f"{summary.get('total_energy_stored_kwh', 0):,.2f} kWh",
    )
    table.add_row(
        "Total delivered",
        f"{summary.get('total_energy_discharged_to_grid_kwh', 0):,.2f} kWh",
    )
    table.add_row(
        "Standby losses",
        f"{summary.get('total_standby_loss_kwh', 0):,.2f} kWh",
    )
    table.add_row("Total cost", f"${summary.get('total_charge_cost', 0):,.2f}")
    table.add_row("Total revenue", f"${summary.get('total_revenue', 0):,.2f}")
    table.add_row("Net profit", f"${summary.get('net_profit', 0):,.2f}")
    table.add_row("Final SOC", f"{summary.get('final_soc_kwh', 0):,.2f} kWh")
    table.add_row("Charge hours", str(summary.get("charge_hours", 0)))
    table.add_row("Discharge hours", str(summary.get("discharge_hours", 0)))
    table.add_row("Standby hours", str(summary.get("standby_hours", 0)))

    console.print(table)

    if output is not None:
        output.parent.mkdir(parents=True, exist_ok=True)
        dispatch_result.to_csv(output, index=False)
        console.print(f"\nDispatch exported to: {output}")


@app.command()
def version():
    console.print("SGES Simulator 0.1.0")


def _print_single_result(result):
    table = Table(title=f"Simulation Result - {result.scenario_name}")

    table.add_column("Metric")
    table.add_column("Value")

    table.add_row("Technology", result.technology_result.technology_name)
    table.add_row(
        "Input energy",
        f"{result.technology_result.input_energy_kwh:,.2f} kWh",
    )
    table.add_row(
        "Max potential energy",
        f"{result.technology_result.max_potential_energy_kwh:,.2f} kWh",
    )
    table.add_row("Stored energy", f"{result.technology_result.stored_energy_kwh:,.2f} kWh")
    table.add_row(
        "Required charge energy",
        f"{result.technology_result.required_charge_energy_kwh:,.2f} kWh",
    )
    table.add_row("Technical delivered energy", f"{result.technology_result.delivered_energy_kwh:,.2f} kWh")
    table.add_row("Available energy", f"{result.available_energy_kwh:,.2f} kWh")
    table.add_row("Gross delivered energy", f"{result.gross_delivered_energy_kwh:,.2f} kWh")
    table.add_row("Effective delivered energy", f"{result.effective_delivered_energy_kwh:,.2f} kWh")
    table.add_row("Charge efficiency", f"{result.technology_result.charge_efficiency:.2%}")
    table.add_row(
        "Discharge efficiency",
        f"{result.technology_result.discharge_efficiency:.2%}",
    )
    table.add_row("Technical round-trip efficiency", f"{result.technology_result.round_trip_efficiency:.2%}")
    table.add_row("Effective round-trip efficiency", f"{result.effective_round_trip_efficiency:.2%}")
    table.add_row("Nominal power", f"{result.technology_result.nominal_power_kw:,.2f} kW")
    table.add_row("Charge power", f"{result.technology_result.charge_power_kw:,.2f} kW")
    table.add_row("Discharge power", f"{result.technology_result.discharge_power_kw:,.2f} kW")
    table.add_row("Charge time", f"{result.technology_result.charge_time_h:,.2f} h")
    table.add_row("Discharge time", f"{result.technology_result.discharge_time_h:,.2f} h")
    table.add_row("Standby time per cycle", f"{result.standby_hours_per_cycle:,.2f} h")
    table.add_row("Standby loss per cycle", f"{result.standby_loss_per_cycle_kwh:,.2f} kWh")
    table.add_row("Standby output loss per cycle", f"{result.standby_output_loss_per_cycle_kwh:,.2f} kWh")
    table.add_row("Fractional cycle loss", f"{result.fractional_cycle_loss_per_cycle_kwh:,.2f} kWh")
    table.add_row("Fixed cycle loss", f"{result.fixed_cycle_loss_per_cycle_kwh:,.2f} kWh")
    table.add_row("Cycle loss per cycle", f"{result.cycle_loss_per_cycle_kwh:,.2f} kWh")
    table.add_row("Total loss per cycle", f"{result.total_loss_per_cycle_kwh:,.2f} kWh")
    table.add_row("Annual standby loss", f"{result.annual_standby_loss_kwh:,.2f} kWh")
    table.add_row("Annual discharged energy", f"{result.annual_discharged_energy_mwh:,.2f} MWh")
    table.add_row("Annual charging energy", f"{result.annual_charging_energy_mwh:,.2f} MWh")
    table.add_row("Annual charging cost", f"${result.annual_charging_energy_cost:,.2f}")
    table.add_row("Annual LCOS cost", f"${result.annual_lcos_cost:,.2f}")
    table.add_row("Status", result.status)
    if result.warnings:
        table.add_row("Warnings", " | ".join(result.warnings))
    table.add_row("Initial CAPEX", f"${result.initial_capex:,.2f}")
    table.add_row("Annual OPEX", f"${result.annual_opex:,.2f}")
    table.add_row("Annual discharged energy", f"{result.annual_discharged_energy_mwh:,.2f} MWh")
    table.add_row(
        "LCOS",
        _format_lcos(
            result.lcos_result.lcos_per_mwh
            if result.lcos_result is not None
            else None
        ),
    )

    console.print(table)


def _export_comparison_csv(rows, output: Path):
    output.parent.mkdir(parents=True, exist_ok=True)

    with output.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)

        writer.writerow(
            [
                "rank",
                "scenario_name",
                "technology_name",
                "stored_energy_kwh",
                "required_charge_energy_kwh",
                "delivered_energy_kwh",
                "charge_efficiency",
                "discharge_efficiency",
                "round_trip_efficiency",
                "nominal_power_kw",
                "charge_power_kw",
                "discharge_power_kw",
                "initial_capex",
                "annual_opex",
                "annual_discharged_energy_mwh",
                "lcos_per_mwh",
            ]
        )

        for index, row in enumerate(rows, start=1):
            writer.writerow(
                [
                    index,
                    row.scenario_name,
                    row.technology_name,
                    row.stored_energy_kwh,
                    row.required_charge_energy_kwh,
                    row.delivered_energy_kwh,
                    row.charge_efficiency,
                    row.discharge_efficiency,
                    row.round_trip_efficiency,
                    row.nominal_power_kw,
                    row.charge_power_kw,
                    row.discharge_power_kw,
                    row.initial_capex,
                    row.annual_opex,
                    row.annual_discharged_energy_mwh,
                    row.lcos_per_mwh,
                ]
            )


def _export_sensitivity_csv(rows, output: Path):
    output.parent.mkdir(parents=True, exist_ok=True)

    with output.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)

        writer.writerow(
            [
                "parameter",
                "value",
                "lcos_per_mwh",
                "initial_capex",
                "annual_energy_mwh",
            ]
        )

        for row in rows:
            writer.writerow(
                [
                    row["parameter"],
                    row["value"],
                    row["lcos"],
                    row["capex"],
                    row["annual_energy_mwh"],
                ]
            )


def _export_monte_carlo_csv(rows, output: Path):
    output.parent.mkdir(parents=True, exist_ok=True)

    parameter_names = sorted(rows[0]["sampled_values"].keys()) if rows else []

    with output.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)

        writer.writerow(
            [
                "iteration",
                *parameter_names,
                "lcos_per_mwh",
                "initial_capex",
                "annual_energy_mwh",
                "round_trip_efficiency",
            ]
        )

        for row in rows:
            writer.writerow(
                [
                    row["iteration"],
                    *[row["sampled_values"][name] for name in parameter_names],
                    row["lcos"],
                    row["capex"],
                    row["annual_energy_mwh"],
                    row["round_trip_efficiency"],
                ]
            )

@app.command()
def batch(
    config_dir: Path = Path("configs"),
    output: Path = Path("data/output/batch_comparison.csv"),
):
    results = run_batch(config_dir)

    if not results:
        raise typer.BadParameter(f"no YAML files found in {config_dir}")

    rows = build_comparison_table(results)

    table = Table(title="Batch Scenario Comparison")
    table.add_column("Rank")
    table.add_column("Scenario")
    table.add_column("Technology")
    table.add_column("Delivered Energy")
    table.add_column("RTE")
    table.add_column("CAPEX")
    table.add_column("Annual Energy")
    table.add_column("LCOS")

    for index, row in enumerate(rows, start=1):
        table.add_row(
            str(index),
            row.scenario_name,
            row.technology_name,
            f"{row.delivered_energy_kwh:,.2f} kWh",
            f"{row.round_trip_efficiency:.2%}",
            f"${row.initial_capex:,.2f}",
            f"{row.annual_discharged_energy_mwh:,.2f} MWh",
            _format_lcos(row.lcos_per_mwh),
        )

    console.print(table)

    _export_comparison_csv(rows, output)
    console.print(f"\nBatch comparison exported to: {output}")

@app.command()
def plot(
    input: Path,
    type: str,
    output: Path,
):
    if type == "sensitivity":
        plot_sensitivity(input, output)

    elif type == "monte_carlo":
        plot_monte_carlo(input, output)

    elif type == "dispatch":
        plot_dispatch(input, output)

    else:
        raise typer.BadParameter("type must be: sensitivity, monte_carlo or dispatch")

    console.print(f"Plot saved to: {output}")

if __name__ == "__main__":
    app()
