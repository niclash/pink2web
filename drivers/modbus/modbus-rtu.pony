use "promises"

use "../../system"
use ".."

actor ModbusRtu is Driver
  new create(context':SystemContext) =>
    None

  be start() =>
    None

  be stop() =>
    None

  be get_physical_ports(promise: Promise[Array[PhysicalPortInfo val] val]) =>
    None

  be add_physical_port_config_listener(listener: PhysicalPortConfigListener) =>
    None

  be remove_physical_port_config_listener(listener: PhysicalPortConfigListener) =>
    None

  be add_physical_port_value_listener(listener: PhysicalPortValueListener) =>
    None

  be remove_physical_port_value_listener(listener: PhysicalPortValueListener) =>
    None
