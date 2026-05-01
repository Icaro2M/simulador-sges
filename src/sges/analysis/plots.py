from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


def plot_sensitivity(csv_path: str | Path, output_path: str | Path):
    df = pd.read_csv(csv_path)

    plt.figure()
    plt.plot(df["value"], df["lcos_per_mwh"], marker="o")

    plt.xlabel("Parameter Value")
    plt.ylabel("LCOS ($/MWh)")
    plt.title("Sensitivity Analysis")

    plt.grid()

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    plt.savefig(output)
    plt.close()


def plot_monte_carlo(csv_path: str | Path, output_path: str | Path):
    df = pd.read_csv(csv_path)

    plt.figure()
    plt.hist(df["lcos_per_mwh"], bins=30)

    plt.xlabel("LCOS ($/MWh)")
    plt.ylabel("Frequency")
    plt.title("Monte Carlo Distribution")

    plt.grid()

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    plt.savefig(output)
    plt.close()


def plot_dispatch(csv_path: str | Path, output_path: str | Path):
    df = pd.read_csv(csv_path)

    plt.figure()
    plt.plot(df["hour"], df["soc_kwh"], label="State of Charge")
    plt.plot(df["hour"], df["price"], label="Price")

    plt.xlabel("Hour")
    plt.title("Dispatch Simulation")

    plt.legend()
    plt.grid()

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    plt.savefig(output)
    plt.close()