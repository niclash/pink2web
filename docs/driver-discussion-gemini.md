# Gemini Summary of Driver subsystem 

This "Two-Layer Mapping" approach (logical graphs, separate physical mapping) is excellent for flexibility and usability. Here are thoughts on its implementation:

1. Logical I/O Block Types:

    * **Definition:** Introduce specific "Logical Input" and "Logical Output" block types. These blocks would have a user-defined `logical_name` property (e.g., "Main Lamp",
"Tank Level").
    * **Purpose:** They act as placeholders in the functional graph, defining the abstract I/O points without direct hardware ties.
    * **Execution:** During runtime, these logical blocks would be "resolved" by the physical mapping layer.

2. Protocol Extensions for Driver Management:
    * **Driver API (`Driver` interface extension):**
        * Extend the `Driver` interface (e.g., `interface tag Driver`) with a new behavior/function: `fun get_physical_ports(): Array[PhysicalPortInfo val] val`.
        * `PhysicalPortInfo` would be a new `class val` containing: `driver_name` (e.g., "modbus"), `port_id` (e.g., "coil_01", "register_40001"), `direction` (Input/Output), `data_type` (Bool, I64, F64), and an optional `description`.
    * **Engine API (REST/WebSocket):**
        * Add a new endpoint (e.g., `/api/physical_ports`) or WebSocket message type to the `RuntimeEngine` that, when queried, iterates through all loaded `Driver` actors and aggregates their `get_physical_ports` responses.
        * Add another endpoint/message for submitting the mapping configuration: `set_mapping(logical_id: String, physical_port_id: String)`. This mapping would link a logical
 block's instance ID and `logical_name` to a specific `PhysicalPortInfo`.
    * **Mapping Storage:** The `RuntimeEngine` needs to store this mapping persistently, perhaps in a new configuration file alongside the graphs, or embedded within the graph
 files themselves.

3. UI for Mapping:

    * **Dedicated View:** A separate "Hardware Mapping" or "I/O Assignment" screen in the UI.
    * **Logical Side:** Display a list of all instantiated "Logical Input" and "Logical Output" blocks from the loaded graph(s).
    * **Physical Side:** Dynamically populate a list of available physical ports by querying the engine's new `get_physical_ports` endpoint.
    * **Interactive Linking:** Allow users to drag-and-drop, or use dropdowns, to create explicit connections between logical block ports and physical I/O ports.
    * **Validation:** The UI should immediately highlight type mismatches (e.g., trying to map a `bool` logical output to an `analog` physical input) or direction mismatches.
    * **Visual Feedback:** Clearly show which logical I/Os are mapped/unmapped.
    * **Import/Export:** Allow saving/loading this mapping configuration independently of the logical graphs.

## FBP Protocol overview
Here are the 3 core FBP commands:

1. **`runtime/ports` (Backend -> UI):**
    * Purpose: Backend pushes the list of *available physical I/O ports*.
    * Triggered: On new UI (websocket) connection, or whenever driver/port availability changes.
    * Payload: Array of `PhysicalPortInfo` (e.g., `{ "driver": "colibri", "id": "AI1", "type": "analog", "direction": "input", "description": "Analog Input 1" }`).
1. **`environment/current_mapping` (Backend -> UI):**
    * Purpose: Backend pushes the *active logical-to-physical I/O mapping*.
    * Triggered: On new UI (websocket) connection, after `environment/apply_mapping` succeeds, or if the mapping changes on the backend.
    * Payload: Array of `MappingEntry` (e.g., `{ "logical_block_id": "lamp_control_1", "logical_port_name": "output", "physical_port_id": "raspi_gpio_23" }`).
1. **`environment/apply_mapping` (UI -> Backend & Backend -> UI):**

    * **UI -> Backend (Command):**
        * Purpose: UI sends a new mapping configuration.
        * Payload: Array of `MappingEntry`.

* **Backend -> UI (Event/Status):**
    * Purpose: Backend acknowledges the `apply_mapping` command (success/failure) or pushes mapping changes.
    * Payload: Status object (e.g., `{ "status": "applied" }` or `{ "status": "error", "message": "Invalid mapping..." }`).


### `runtime/ports` Message (Physical I/O Annunciation)

The `runtime/ports` message is broadcast by the backend whenever there's a change in the available physical I/O ports provided by loaded drivers, or upon a new client
(e.g., UI) connection. This message serves to dynamically inform clients about the physical I/O capabilities of the connected hardware and emulators.

Unlike its original FBP specification, this implementation **does not** relate to a "main graph" and its external logical ports. Instead, it exclusively lists the physical
I/O points discovered from the active drivers.

#### Message Structure

The message payload is a JSON object containing `inPorts` and `outPorts` arrays. Each array lists objects representing physical input and output ports, respectively.

```json
{
  "inPorts": [
    {
      "id": "urn:<driver_name>:<port_identifier>",
      "type": "<data_type>",
      "description": "<textual_description_of_port>",
      "schema": "",
      "required": false,
      "addressable": false,
      "values": [],
      "default": null
    }
    // ... more input port objects
  ],
  "outPorts": [
    {
      "id": "urn:<driver_name>:<port_identifier>",
      "type": "<data_type>",
      "description": "<textual_description_of_port>",
      "schema": "",
      "required": false,
      "addressable": false,
      "values": [],
      "default": null
    }
    // ... more output port objects
  ]
}
```

#### Field Definitions

* **`id` (string)**: A unique identifier for the physical port, formatted as a Uniform Resource Name (URN). This URN includes the driver name (`<driver_name>`) and a driver-specific identifier for the port (`<port_identifier>`).
* *Examples:* 
  * `urn:colibri:AI1`
  * `urn:raspi:GPIO-23`
  * `urn:emulator:LED-PWR`
* **`type` (string)**: The data type of the port. Common values include `boolean`, `I64` (integer), `F64` (float), `string`, etc.
* **`description` (string)**: A human-readable description of the port's function or physical location.
* **`schema` (string, optional)**: (Currently unused in this context) Link to a JSON schema for data validation on this port. Typically an empty string.
* **`required` (boolean)**: (Currently unused in this context) Indicates whether the port needs to be connected. Always `false` for physical ports.
* **`addressable` (boolean)**: (Currently unused in this context) Indicates if the port is an array port. Always `false` for individual physical ports.
* **`values` (array, optional)**: A list of discrete values accepted for the port (e.g., for an enum-like port).
* **`default` (any, optional)**: A default value for the port.

#### Example

```json 
  {
    "inPorts": [
      {
        "id": "urn:colibri:AI1",
        "type": "F64",
        "description": "Colibri Analog Input 1",
        "schema": "", "required": false, "addressable": false, "values": [], "default": null
      },
      {
        "id": "urn:emulator:DI_LightSensor",
        "type": "boolean",
        "description": "Emulated Digital Input for Light Sensor",
        "schema": "", "required": false, "addressable": false, "values": [], "default": null
      }
    ],
    "outPorts": [
      {
        "id": "urn:raspi:GPIO-23",
        "type": "boolean",
        "description": "Raspberry Pi GPIO Pin 23 for LED control",
        "schema": "", "required": false, "addressable": false, "values": [], "default": null
      },
      {
        "id": "urn:modbus:Coil_001",
        "type": "boolean",
        "description": "Modbus RTU Coil 1 for Valve Control",
        "schema": "", "required": false, "addressable": false, "values": [], "default": null
      }
    ]
  }
```

### `environment/current_mapping` Message (Current I/O Mapping Annunciation)
The `environment/current_mapping` message is broadcast by the backend to inform clients about the currently active logical-to-physical I/O mappings. This message is sent
upon a new client (e.g., UI) connection, after a successful `environment/apply_mapping` command, or whenever the backend's internal mapping configuration changes.

Unmapped logical I/O points are simply omitted from this list.

#### Message Structure

The message payload is a JSON object containing a single array, `mappings`, which represents the list of active mappings. Each item in this array is a `MappingEntry` 
object.

```json
{
  "port_mappings": [
    {
      "logical_io_id": "urn:<graph_id>:<logical_block_instance_id>",
      "physical_port_id": "urn:<driver_name>:<port_identifier>"
    }
    // ... more mapping entry objects
  ]
}
```

### Field Definitions

* **`mappings` (array of objects)**: A list of `MappingEntry` objects, each defining a single logical-to-physical I/O mapping.
    * Each `MappingEntry` object contains:
        * **`logical_io_id` (string)**: A URN that uniquely identifies a specific logical I/O block instance within a particular graph.
            * *Format:* `urn:<graph_id>:<logical_block_instance_id>`
            * *Example:* `urn:my_process_graph_abc:temp_sensor_block_001`

        * **`physical_port_id` (string)**: The URN of the physical I/O port that this logical I/O point is mapped to. This ID must match an `id` provided by a
`runtime/ports` message.
            * *Format:* `urn:<driver_name>:<port_identifier>`
            * *Example:* `urn:colibri:AI1`, `urn:raspi:GPIO-23`, `urn:emulator:LED-PWR`

### Example
```json 
{
  "port_mappings": [
    {
      "logical_io_id": "urn:main_floor_hvac:thermostat_input_1",
      "physical_port_id": "urn:colibri:PT1000_2"
    },
    {
      "logical_io_id": "urn:lighting_control_graph:overhead_lights_output",
      "physical_port_id": "urn:raspi:GPIO-17"
    },
    {
      "logical_io_id": "urn:test_simulation:virtual_button_feedback",
      "physical_port_id": "urn:emulator:DI_TestButton"
    }
  ]
}
```


## `environment/apply_mapping` Message (I/O Mapping State)

The `environment/apply_mapping` message serves a dual purpose:

1.  **UI to Backend (Command)**: Clients send this message to request a change in the connection state for a specific logical-to-physical I/O mapping.
2.  **Backend to UI (Event)**: The backend broadcasts this message to inform clients about the actual, confirmed state of a specific logical-to-physical I/O mapping. This
event is sent when a requested state change is successfully applied, or when the backend determines a mapping's state has changed.

Failures or invalid mapping requests are typically communicated via separate error or log message types, not through this `apply_mapping` message itself.

### Message Structure (Command and Event)

The message payload is a JSON object with the following structure:

```json
{
  "logical_io_id": "urn:<graph_id>:<logical_block_instance_id>",
  "physical_port_id": "urn:<driver_name>:<port_identifier>",
  "state": "<connection_state>"
}
```

### Field Definitions

* **`logical_io_id` (string)**:
    * **Purpose**: A URN that uniquely identifies a specific logical I/O block instance within a particular graph.
    * **Format**: `urn:<graph_id>:<logical_block_instance_id>`
    * *Example*: `urn:hvac_system_graph:room_temp_input_sensor_1`
    * 
* **`physical_port_id` (string)**:
    * **Purpose**: The URN of the physical I/O port that this logical I/O point is (or should be) mapped to. This ID must correspond to an `id` provided by a `runtime/ports` message.
    * **Format**: `urn:<driver_name>:<port_identifier>`
    * *Example*: `urn:colibri:AI1`, `urn:raspi:GPIO-23`, `urn:emulator:DI_EmergencyStop`

* **`state` (string)**:
    * **Purpose**: Defines the desired (in command) or actual (in event) connection state of the mapping.
    * **Possible Values**:
        * `"connected"`: Indicates that the `logical_io_id` is linked to the `physical_port_id`.
        * `"disconnected"`: Indicates that the `logical_io_id` is no longer linked to the `physical_port_id`.

### Examples

UI to Backend (Command): Requesting a connection
```json
    {
      "logical_io_id": "urn:main_lighting_graph:lobby_lights_control",
      "physical_port_id": "urn:raspi:GPIO-23",
      "state": "connected"
    }
```
UI to Backend (Command): Requesting a disconnection
```json
    {
      "logical_io_id": "urn:main_lighting_graph:lobby_lights_control",
      "physical_port_id": "urn:raspi:GPIO-23",
      "state": "disconnected"
    }
```
Backend to UI (Event): Confirming a connection
```json
    {
      "logical_io_id": "urn:main_lighting_graph:lobby_lights_control",
      "physical_port_id": "urn:raspi:GPIO-23",
      "state": "connected"
    }
```
Backend to UI (Event): Confirming a disconnection
```json
    {
      "logical_io_id": "urn:main_lighting_graph:lobby_lights_control",
      "physical_port_id": "urn:raspi:GPIO-23",
      "state": "disconnected"
    }
```
