# Gandhinagar Electric Bus Network Integration (PM-eBus Sewa & GGTSL)

## 1. Executive Summary

Lambda now integrates the **Gandhinagar Electric Bus Network** as a first-class, zero-emission transit mode alongside Ahmedabad Metro, BRTS, AMTS, and Indian Railways. 

This network is operated by **Gandhinagar Greenline Transport Service Limited (GGTSL)** under the Government of India's **PM-eBus Sewa** initiative, complemented by the **GIFT City Autonomous EV Shuttle** network.

---

## 2. Network Architecture & Transit Modes

### Supported First-Class Modes in Lambda
1. 🚇 **Ahmedabad Metro** (GMRC Red & Blue Lines)
2. 🚌 **Ahmedabad BRTS** (Janmarg Corridors)
3. 🚌 **Ahmedabad AMTS** (Municipal Feeder Lines)
4. 🚌⚡ **Gandhinagar Electric Bus** (`GANDHINAGAR_ELECTRIC_BUS` - GGTSL PM-eBus Sewa)
5. 🚌 **Other Supported Gandhinagar Bus Services** (GIFT City EV Shuttles, GSECL Intercity)
6. 🚆 **Indian Railways** (Sabarmati, Kalupur, Gandhinagar Capital)
7. 🚶 **Pedestrian Interchanges** (Sheltered walkways, station concourses)

### Key Agency & Operator Distinction
* **GGTSL (Gandhinagar Greenline Transport Service Limited)**:
  * Agency Code: `GGTSL`
  * Role: Primary municipal electric bus operator for Gandhinagar city sectors, capital complex, and regional corridors.
  * Fleet: 9m & 12m AC low-floor Battery Electric Buses (BEV) under PM-eBus Sewa.
* **GIFT City Bus Provider**:
  * Agency Code: `GIFT_TRANSIT`
  * Role: Automated / EV shuttle transit connecting GIFT City Multi-Services SEZ, GIFT Diamond Tower, GIFT Metro Station, and residential precincts.

---

## 3. Route Catalog (E-1 to E-16 & GIFT Shuttles)

| Route ID | Route Number | Origin | Destination | Frequency | Key Interchanges |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GGTSL-E1` | **E-1** | Gandhinagar Railway Station | Mahatma Mandir | 10 mins | Sector 11, Central Secretariat |
| `GGTSL-E2` | **E-2** | Akshardham Temple | GIFT City Multi-Services SEZ | 12 mins | Sector 21 Hub, GIFT Metro |
| `GGTSL-E3` | **E-3** | Sector 21 Central Depot | Infocity Tech Park | 15 mins | Sector 16, Indroda Park |
| `GGTSL-E4` | **E-4** | Gandhinagar Capital Stn | Gujarat National Law University (GNLU) | 15 mins | Koba Circle, PDPU Cross |
| `GGTSL-E5` | **E-5** | Mahatma Mandir | DA-IICT Institute | 15 mins | Infocity, Reliance Cross |
| `GGTSL-E6` | **E-6** | Sector 28 Industrial | Kudasan IT Corridor | 20 mins | Sector 21, Bhaijipura |
| `GGTSL-E7` | **E-7** | Pathikashram Bus Terminal | Gandhinagar Civil Hospital | 12 mins | Sector 11, Sector 12 |
| `GGTSL-E8` | **E-8** | Sector 1 Secretariat Complex | Sector 30 Green Park | 15 mins | Sector 16, Sector 24 |
| `GGTSL-E9` | **E-9** | Koba Circle Metro Interchange | GIFT City Hub | 10 mins | Koba Hub, GIFT Gate 1 & 2 |
| `GGTSL-E10`| **E-10**| Motera Stadium Metro | Infocity Gandhinagar (Express) | 12 mins | Motera Metro, Koba Circle |
| `GGTSL-E11`| **E-11**| Sabarmati Railway Station | Mahatma Mandir Super Express | 20 mins | Visat Gandhinagar Hwy |
| `GGTSL-E12`| **E-12**| Sector 21 Central Depot | Chiloda Circle Hub | 20 mins | Sector 28, National Hwy |
| `GGTSL-E13`| **E-13**| Sargasan Cross Roads | GIFT One & Two Towers | 15 mins | Kudasan, Raysan |
| `GGTSL-E14`| **E-14**| PDPU Campus | Gujarat Law University (GNLU) | 20 mins | Bhaijipura, Raysan |
| `GGTSL-E15`| **E-15**| Gandhinagar Capital Rly | National Institute of Design (NID) | 15 mins | Sector 1, GH-Road |
| `GGTSL-E16`| **E-16**| Mahatma Mandir Concourse | GIFT City Grand Concourse (Direct) | 15 mins | Sector 11, GIFT SEZ Hub |
| `GIFT-AC1` | **GIFT-AC-1**| GIFT City Metro Station | GIFT Diamond Tower SEZ Loop | 8 mins | GIFT One, GIFT Concourse |

---

## 4. Backend REST API Endpoints

All electric bus endpoints are exposed under `/api/electric-bus/` and `/api/transit/electric-bus/`:

### 1. Dynamic Fleet & Environmental Stats
* **URL**: `GET /api/electric-bus/stats/`
* **Response**:
  ```json
  {
    "network_name": "Gandhinagar Greenline Electric Bus Network (GGTSL)",
    "program": "PM-eBus Sewa & Gujarat Green Mobility Initiative",
    "operator": "Gandhinagar Greenline Transport Service Limited (GGTSL)",
    "partner_agency": "GIFT Urban Mobility Provider",
    "fleet_metrics": {
      "fleet_total": 85,
      "fleet_deployed": 68,
      "fleet_active": 54,
      "active_routes_count": 17,
      "electrified_stops_count": 121,
      "ev_depots_count": 3,
      "ev_depot_locations": [
        "Sector 21 GGTSL Central Electric Depot",
        "Pathikashram Main EV Fast Charging Hub",
        "GIFT City Automated Transit EV Hub"
      ]
    },
    "environmental_impact": {
      "clean_km_today": 9990,
      "co2_saved_kg_today": 8191,
      "diesel_saved_liters_today": 2628,
      "tree_equivalent_co2_offset": 377,
      "zero_tailpipe_emissions": true
    },
    "service_quality": {
      "fleet_electrification_rate": "100%",
      "air_conditioned_pct": 100,
      "low_floor_accessible_pct": 100,
      "average_battery_soc_pct": 78,
      "on_time_performance_pct": 94.6,
      "average_peak_headway_mins": 12
    },
    "provenance": "DEMO DATA",
    "last_updated": "2026-09-10T20:25:00Z"
  }
  ```

### 2. Routes Catalog
* **URL**: `GET /api/electric-bus/routes/`
* **Query Params**: `?operator=GGTSL&origin=Gandhinagar&q=E-1`

### 3. Electrified Stops & Hubs
* **URL**: `GET /api/electric-bus/stops/`
* **Query Params**: `?sector=21&q=Infocity`

### 4. Live Vehicle Telemetry & Battery Health
* **URL**: `GET /api/electric-bus/vehicles/`
* **Query Params**: `?operator=GGTSL&route=E-1`
* **Telemetry Fields**: `battery_soc_pct`, `charging_status`, `speed_kmh`, `delay_minutes`, `provenance`, `last_updated`.

### 5. Live Departure Board
* **URL**: `GET /api/electric-bus/departures/?stop_id=GNR-E-01&limit=8`

### 6. Disruption & Service Alerts
* **URL**: `GET /api/electric-bus/alerts/`

---

## 5. Multimodal Routing & Transfer Risk Intelligence

### Key Capabilities:
1. **Full Graph Interconnection**:
   * Bridges Motera Metro / Sabarmati Hub with Gandhinagar Capital & GIFT City via dedicated transfer edges.
2. **Transfer Risk Analysis**:
   * Transfers with connection buffer $< 5\text{ mins}$ are flagged as **`🔴 HIGH RISK TRANSFER`** with estimated miss probability and automatic recommendation of the next safe departure time.
   * Transfers with buffer $\ge 5\text{ mins}$ are marked as **`PROTECTED CONNECTION`**.
3. **Minimize Waiting Route Preference**:
   * Journeys can be ranked by `MINIMIZE_WAITING` (`⏱ MINIMIZE WAITING`), prioritizing routes with the shortest transfer layovers.
4. **Live Turn-by-Turn Companion Mode**:
   * Real-time GPS-assisted step progress bar, countdown to next station, and transfer walk reminders.

---

## 6. Data Provenance & Ethics
* In accordance with transit data integrity standards, Lambda **never fabricates GPS coordinates** as live data feeds.
* When live IoT vehicle telemetry is not connected to city GTFS-RT servers, feeds are transparently watermarked as `DEMO DATA` or `ESTIMATED / PROJECTED`.
