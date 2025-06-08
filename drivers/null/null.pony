use "collections"
use "promises"

use "../../system"
use ".."

actor NullDriver is Driver
  let _drivers:Drivers
  let _context:SystemContext

  new create(context':SystemContext, config':Map[String,String] val, drivers':Drivers) =>
    _drivers = drivers'
    _context = context'

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
