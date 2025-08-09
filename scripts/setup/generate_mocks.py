"""Generate realistic weather mock data for testing."""

import json
import random
from pathlib import Path
from typing import Dict, Any, List

import click

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from common import (
    get_project_root, get_frameworks_config, get_framework_asset_dir,
    show_header, show_success, show_error
)


class MockWeatherGenerator:
    """Generate realistic weather mock data."""
    
    def __init__(self):
        """Initialize the generator with seeded random for consistent results."""
        random.seed(42)  # Consistent seed for reproducible mock data
        
        self.cities = [
            "New York", "London", "Tokyo", "Paris", "Sydney", 
            "Berlin", "Toronto", "Mumbai", "Singapore", "Amsterdam"
        ]
        
        self.weather_conditions = [
            {"condition": "sunny", "icon": "01d", "description": "Clear sky"},
            {"condition": "partly-cloudy", "icon": "02d", "description": "Few clouds"},
            {"condition": "cloudy", "icon": "03d", "description": "Scattered clouds"},
            {"condition": "overcast", "icon": "04d", "description": "Broken clouds"},
            {"condition": "rainy", "icon": "09d", "description": "Shower rain"},
            {"condition": "stormy", "icon": "11d", "description": "Thunderstorm"},
            {"condition": "snowy", "icon": "13d", "description": "Snow"},
        ]
    
    def seeded_random(self, start: float, end: float) -> float:
        """Generate seeded random number for consistency."""
        return random.uniform(start, end)
    
    def generate_forecast_day(self, day_offset: int = 0) -> Dict[str, Any]:
        """Generate weather data for a specific day."""
        condition = random.choice(self.weather_conditions)
        base_temp = self.seeded_random(15, 25)
        
        return {
            "date": f"2024-03-{15 + day_offset:02d}",
            "temperature": round(base_temp, 1),
            "high": round(base_temp + self.seeded_random(3, 8), 1),
            "low": round(base_temp - self.seeded_random(2, 6), 1),
            "condition": condition["condition"],
            "description": condition["description"],
            "icon": condition["icon"],
            "humidity": round(self.seeded_random(40, 80)),
            "wind_speed": round(self.seeded_random(5, 25), 1),
            "wind_direction": random.choice(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
            "precipitation": round(self.seeded_random(0, 20), 1),
            "pressure_msl": round(self.seeded_random(995, 1025), 1),
            "is_day": day_offset == 0  # Current day is day, others determined by time
        }
    
    def generate_weather_data(self) -> Dict[str, Any]:
        """Generate complete weather mock data."""
        current = self.generate_forecast_day(0)
        forecast = [self.generate_forecast_day(i) for i in range(1, 6)]
        
        return {
            "location": {
                "name": random.choice(self.cities),
                "country": "Mock Country",
                "lat": round(self.seeded_random(-90, 90), 4),
                "lon": round(self.seeded_random(-180, 180), 4)
            },
            "current": current,
            "forecast": forecast,
            "last_updated": "2024-03-15T12:00:00Z"
        }


@click.command()
def generate_mocks():
    """Generate weather mock data for all framework apps."""
    show_header("Mock Data Generator", "Creating realistic weather data for testing")
    
    project_root = get_project_root()
    apps_dir = project_root / "apps"
    frameworks_config = get_frameworks_config()
    
    # Generate mock data
    generator = MockWeatherGenerator()
    mock_data = generator.generate_weather_data()
    
    frameworks = [fw["id"] for fw in frameworks_config.get("frameworks", [])]
    failed_apps = []
    
    for framework in frameworks:
        try:
            app_path = apps_dir / framework
            if not app_path.exists():
                show_error(f"App directory not found: {app_path}")
                failed_apps.append(framework)
                continue
            
            # Get framework-specific asset directory
            asset_dir_name = get_framework_asset_dir(framework, frameworks_config)
            mocks_dir = app_path / asset_dir_name / "mocks"
            mocks_dir.mkdir(parents=True, exist_ok=True)
            
            # Write mock data
            mock_file = mocks_dir / "weather-data.json"
            with open(mock_file, "w") as f:
                json.dump(mock_data, f, indent=2)
                
        except Exception as e:
            show_error(f"Failed to generate mocks for {framework}: {e}")
            failed_apps.append(framework)
    
    # Summary
    success_count = len(frameworks) - len(failed_apps)
    show_success(f"Generated mock data for {success_count}/{len(frameworks)} apps")
    
    if failed_apps:
        show_error(f"Failed to generate mocks for: {', '.join(failed_apps)}")


if __name__ == "__main__":
    generate_mocks()