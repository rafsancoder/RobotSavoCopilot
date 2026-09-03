# Live Sensors HTTP API

Robot Savo Copilot reads summarized, read-only telemetry from `GET /app/telemetry` on the SavoMind base URL already configured in Settings. The app does not connect to ROS 2, hardware, sockets, or robot-control endpoints.

## Response contract

- Content type: `application/json`
- `timestamp_utc` must be an ISO 8601 UTC timestamp.
- Numbers must be finite JSON numbers. Unknown values should be omitted or `null`.
- Sensor `status` values are `live`, `stale`, `offline`, `unavailable`, or `not_exposed`.
- Ages are milliseconds (`age_ms`) measured when the backend creates the response.
- Full LaserScan arrays, point clouds, video, and microphone audio must not be included.
- Battery percentages must be `null` (and their validity flag `false`) when they are not calibrated.
- A server without telemetry support should return HTTP 404; the app presents a dedicated unavailable message.

Fields are optional so older or partially instrumented robots remain safe to inspect. The app renders missing values as `--` or `Not exposed`.

## Example

This example documents shape only. Its values are not bundled into or used as live data by the app.

```json
{
  "ok": true,
  "connected": true,
  "timestamp_utc": "2026-09-03T10:15:30.250Z",
  "overall_health": "healthy",
  "safety": { "stop": false, "slowdown_factor": 1.0, "state": "CLEAR" },
  "ranges": {
    "left_m": 0.54,
    "right_m": 0.62,
    "front_ultrasonic_m": 0.88,
    "depth_min_front_m": 1.24
  },
  "imu": {
    "status": "live",
    "age_ms": 35,
    "orientation": { "x": 0.0, "y": 0.0, "z": 0.72, "w": 0.69 },
    "roll_deg": 0.1,
    "pitch_deg": -0.3,
    "yaw_deg": 92.5,
    "angular_velocity": { "x": 0.0, "y": 0.0, "z": 0.02 },
    "linear_acceleration": { "x": 0.01, "y": 0.02, "z": 9.8 },
    "calibration_status": "calibrated"
  },
  "lidar": { "status": "live", "scan_rate_hz": 8.2, "valid_points": 341, "minimum_range_m": 0.21, "maximum_range_m": 6.8, "age_ms": 48 },
  "realsense": { "status": "live", "depth_status": "live", "min_front_m": 1.24, "pointcloud_rate_hz": 12.0, "depth_fps": 30, "color_fps": 30, "age_ms": 42 },
  "visual_odometry": { "status": "live", "health": "healthy", "tracking_quality": "good", "x_m": 1.4, "y_m": 0.3, "z_m": 0.0, "yaw_deg": 18.2, "linear_velocity_mps": 0.12, "age_ms": 40 },
  "wheel_odometry": {
    "status": "live", "x_m": 1.42, "y_m": 0.31, "yaw_deg": 18.4, "linear_velocity_mps": 0.12, "angular_velocity_radps": 0.02, "age_ms": 35,
    "wheels": { "front_left": { "ticks": 12450, "velocity": 0.12 }, "front_right": { "ticks": 12462, "velocity": 0.12 } }
  },
  "localization": { "status": "live", "x_m": 1.43, "y_m": 0.32, "yaw_deg": 18.3, "linear_speed_mps": 0.12, "angular_speed_radps": 0.02, "age_ms": 30 },
  "head_camera": { "status": "live", "fps": 30, "frame_age_ms": 38, "pan_deg": 4, "tilt_deg": -8 },
  "speech": { "status": "live", "microphone_healthy": true, "service_healthy": true, "capture_active": false, "playback_active": false },
  "power": {
    "status": "live", "health": "healthy", "low": false, "critical": false, "age_ms": 200,
    "base_voltage_v": 7.9, "base_percentage": null, "base_percentage_valid": false,
    "core_ups_voltage_v": 5.1, "core_ups_percentage": 82, "core_ups_percentage_valid": true,
    "edge_ups_voltage_v": 5.1, "edge_ups_percentage": 78, "edge_ups_percentage_valid": true
  }
}
```

The aggregation backend is responsible for subscribing to the documented Robot Savo ROS 2 topics, reducing their output to these summaries, calculating ages/statuses, and serving this endpoint without accepting commands.
