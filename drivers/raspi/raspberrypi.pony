
use "collections"
use "promises"
use "gpiod"
use "../../system"
use ".."

actor RaspberryPi is Driver
  let _drivers: Drivers
  let _config:Map[String,String] val

  new create(context':SystemContext, config':Map[String,String] val, drivers: Drivers) =>
    _config = config'
    _drivers = drivers

  be start() =>
    None

  be stop() =>
    None

  be get_physical_ports(promise: Promise[PhysicalIoPortInfo]) =>
    None

  be add_physical_port_config_listener(listener: PhysicalPortConfigNotify) =>
    None

  be remove_physical_port_config_listener(listener: PhysicalPortConfigNotify) =>
    None

  be add_physical_port_value_listener(listener: PhysicalPortValueNotify) =>
    None

  be remove_physical_port_value_listener(listener: PhysicalPortValueNotify) =>
    None

