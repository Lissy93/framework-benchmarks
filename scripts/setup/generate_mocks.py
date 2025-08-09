"""Generate realistic weather mock data for testing."""

import json
import random
from pathlib import Path
from typing import Dict, Any, List
import shutil

import click

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from common import (
    get_project_root, get_frameworks_config, get_framework_asset_dir,
    show_header, show_success, show_error
)

class MockWeatherGenerator:
    """Generate mock weather data matching required structure."""

    def __init__(self) -> None:
        random.seed(42)

    def generate_mock_data(self) -> Dict[str, Any]:
        # Hardcoded values for latitude, longitude, timezone, etc.
        latitude = 51.5074
        longitude = -0.1278
        timezone = "GMT"
        timezone_abbreviation = "GMT"
        elevation = 38
        generationtime_ms = round(random.uniform(0.2, 0.3), 2)
        utc_offset_seconds = 0

        current_units = {
            "time": "iso8601",
            "temperature_2m": "°C",
            "relative_humidity_2m": "%",
            "apparent_temperature": "°C",
            "weather_code": "wmo code",
            "cloud_cover": "%",
            "surface_pressure": "hPa",
            "wind_direction_10m": "°",
            "wind_speed_10m": "km/h"
        }

        current = {
            "time": "2025-08-07T04:39",
            "temperature_2m": 20.5,
            "relative_humidity_2m": 68,
            "apparent_temperature": 21.8,
            "weather_code": 1,
            "cloud_cover": 45,
            "surface_pressure": 1015.3,
            "wind_direction_10m": 230,
            "wind_speed_10m": 12.4
        }

        daily_units = {
            "time": "iso8601",
            "temperature_2m_max": "°C",
            "temperature_2m_min": "°C",
            "weather_code": "wmo code",
            "sunrise": "iso8601",
            "sunset": "iso8601",
            "rain_sum": "mm",
            "uv_index_max": "",
            "precipitation_probability_max": "%"
        }

        daily = {
            "time": [
                "2025-08-07",
                "2025-08-08",
                "2025-08-09",
                "2025-08-10",
                "2025-08-11",
                "2025-08-12",
                "2025-08-13"
            ],
            "temperature_2m_max": [
                21,
                24.1,
                20.2,
                23.6,
                19.2,
                24.5,
                16.8
            ],
            "temperature_2m_min": [
                8.1,
                10.4,
                9.8,
                17.2,
                10.5,
                14,
                14
            ],
            "weather_code": [
                2,
                3,
                63,
                3,
                2,
                2,
                61
            ],
            "sunrise": [
                "2025-08-07T06:12:00",
                "2025-08-08T07:32:00",
                "2025-08-09T06:17:00",
                "2025-08-10T06:49:00",
                "2025-08-11T06:47:00",
                "2025-08-12T06:40:00",
                "2025-08-13T07:05:00"
            ][:7],
            "sunset": [
                "2025-08-07T18:43:00",
                "2025-08-08T18:24:00",
                "2025-08-09T19:39:00",
                "2025-08-10T20:27:00",
                "2025-08-11T18:37:00",
                "2025-08-12T20:05:00",
                "2025-08-13T20:43:00"
            ][:7],
            "rain_sum": [
                0.21,
                7.19,
                8.97,
                8.14,
                8.41,
                12.92,
                2.6
            ],
            "uv_index_max": [
                2.13,
                6.87,
                2.96,
                3.3,
                5.62,
                5.21,
                6.09
            ],
            "precipitation_probability_max": [
                32,
                31,
                93,
                6,
                8,
                15,
                1
            ]
        }

        return {
            "latitude": latitude,
            "longitude": longitude,
            "generationtime_ms": generationtime_ms,
            "utc_offset_seconds": utc_offset_seconds,
            "timezone": timezone,
            "timezone_abbreviation": timezone_abbreviation,
            "elevation": elevation,
            "current_units": current_units,
            "current": current,
            "daily_units": daily_units,
            "daily": daily
        }


@click.command()
def generate_mocks() -> None:
    """Generate weather mock data for all framework apps."""
    show_header("Mock Data Generator", "Creating realistic weather data for testing")

    project_root = get_project_root()
    apps_dir = project_root / "apps"
    frameworks_config = get_frameworks_config()

    # Task 1: Generate mock data
    generator = MockWeatherGenerator()
    mock_data = generator.generate_mock_data()

    # Task 2: Write to assets/mocks/weather-data.json
    assets_mocks_dir = project_root / "assets" / "mocks"
    assets_mocks_dir.mkdir(parents=True, exist_ok=True)
    assets_mock_file = assets_mocks_dir / "weather-data.json"
    with open(assets_mock_file, "w") as f:
        json.dump(mock_data, f, indent=2)

    frameworks = [fw["id"] for fw in frameworks_config.get("frameworks", [])]
    failed_apps: List[str] = []

    # Task 3: Copy the same file to each app
    for framework in frameworks:
        try:
            app_path = apps_dir / framework
            if not app_path.exists():
                show_error(f"App directory not found: {app_path}")
                failed_apps.append(framework)
                continue

            asset_dir_name = get_framework_asset_dir(framework, frameworks_config)
            mocks_dir = app_path / asset_dir_name / "mocks"
            mocks_dir.mkdir(parents=True, exist_ok=True)

            mock_file = mocks_dir / "weather-data.json"
            shutil.copyfile(assets_mock_file, mock_file)

        except Exception as e:
            show_error(f"Failed to generate mocks for {framework}: {e}")
            failed_apps.append(framework)

    success_count = len(frameworks) - len(failed_apps)
    show_success(f"Generated mock data for {success_count}/{len(frameworks)} apps")

    if failed_apps:
        show_error(f"Failed to generate mocks for: {', '.join(failed_apps)}")


if __name__ == "__main__":
    generate_mocks()
