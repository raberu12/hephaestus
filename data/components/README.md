# Component Database

This directory contains PC component data used for AI-powered build recommendations.

## Data Source

**Source:** PCPartPicker  
**Last Updated:** July 23, 2025

## Files

| File | Description |
|------|-------------|
| `cpu.json` | Processors (Intel, AMD) |
| `video-card.json` | Graphics cards (NVIDIA, AMD, Intel) |
| `motherboard.json` | Motherboards |
| `memory.json` | RAM modules |
| `power-supply.json` | PSU units |
| `case.json` | PC cases |
| `cpu-cooler.json` | CPU coolers |
| `internal-hard-drive.json` | Storage drives |
| `monitor.json` | Displays |

## Data Structure

### CPU
```json
{
  "name": "AMD Ryzen 7 9800X3D",
  "price": 451.5,
  "core_count": 8,
  "core_clock": 4.7,
  "boost_clock": 5.2,
  "microarchitecture": "Zen 5",
  "tdp": 120,
  "graphics": "Radeon"
}
```

### GPU
```json
{
  "name": "MSI GeForce RTX 3060 Ventus 2X 12G",
  "price": 299.97,
  "chipset": "GeForce RTX 3060 12GB",
  "memory": 12,
  "core_clock": 1320,
  "boost_clock": 1777,
  "length": 235
}
```

## Notes

- Prices are in USD and converted to PHP (×58) at runtime
- Some entries may have `null` for missing data
- Graphics field identifies APUs (CPUs with integrated graphics)
