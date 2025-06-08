use "collections"
use "promises"

use "../../system"
use ".."

actor ModbusTcp is Driver
  let _drivers:Drivers
  let _context:SystemContext
  let _config:Map[String,String] val

  new create(context':SystemContext, config':Map[String,String] val, drivers':Drivers) =>
    _drivers = drivers'
    _context = context'
    _config = config'

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
