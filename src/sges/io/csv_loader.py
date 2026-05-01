from pathlib import Path

import pandas as pd


def load_time_series_csv(path: str | Path) -> pd.DataFrame:
    df = pd.read_csv(path)

    required_columns = {"hour", "price"}

    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"missing required columns: {sorted(missing)}")

    return df