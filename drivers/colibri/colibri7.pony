use "collections"
use "files"
use "promises"
use "raspi"
use "time"
use "../../system"
use ".."

// NOTE!!!!!!!!!!!!!!!!!!
// This driver is ONLY copied from the Link2Web driver and changed the names. NOTHING ELSE has been considered or fixed to make it work on Colibri yet.

actor Colibri7 is Driver
  let _multiplexer:ColibriMultiplexer
  let _expansions:Map[U8, ColibriExpansionCard] = Map[U8,ColibriExpansionCard]
  let _context:SystemContext
  let _bus:I2CBus

  new create(context':SystemContext) =>
    _context = context'
    _bus = I2C.bus(0, FileAuth(context'.auth()) )
    _multiplexer = ColibriMultiplexer(_bus, context')

  be start() =>
    _find_devices()

  be stop() => None

  be _find_devices() =>
    var slot:U8 = 0
    while slot < 8 do
      _multiplexer.select(slot)
      let eeprom = I2CDevice(0x50,_bus)
      let driver':Colibri7 tag = this
      eeprom.read_bytes(256, { (data, status) =>
        match status
        | I2COk => ColibriExpansionFactory.createFactory(slot, data, _context, driver')
        | I2COpenError => _context(Error) and _context.log(Error, "I2C: Device is already opened" )
        | I2CNotOpenError => _context(Error) and _context.log(Error, "I2C: Device is not opened" )
        | I2CWriteError => _context(Error) and _context.log(Error, "I2C: Write Error" )
        | I2CReadError => _context(Error) and _context.log(Error, "I2C: Read Error" )
        | I2CUnknownError => _context(Error) and _context.log(Error, "I2C: Unknown Error" )
        end
      })
      slot = slot + 1
    end

  be _update_devices() =>
    None

  be register(slot:U8, expansion:ColibriExpansionCard) =>
    _expansions(slot) = expansion

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


primitive ColibriExpansionFactory
  fun createFactory(slot:U8, data:Array[U8] val, context:SystemContext, driver:Colibri7) =>
    try
      let manufacturer:U16 = (data(0)?).u16() + ((data(1)?).u16() * 256)
      let device:U16 = (data(2)?).u16() + ((data(3)?).u16() * 256)
      let revision:U16 = (data(4)?).u16() + ((data(5)?).u16() * 256)
      if manufacturer == 0  then // Bali Automation
        match device
        | 1 => driver.register( slot, ColibriAiv(slot,revision,data,context))
        | 2 => driver.register( slot, ColibriAic(slot,revision,data,context))
        | 3 => driver.register( slot, ColibriAqv(slot,revision,data,context))
        | 4 => driver.register( slot, ColibriTriac1(slot,revision,data,context))
        | 5 => driver.register( slot, ColibriPid1(slot,revision,data,context))
        | 5 => driver.register( slot, ColibriPt1000(slot,revision,data,context))
        | 9 => driver.register( slot, ColibriDii(slot,revision,data,context))
        | 9 => driver.register( slot, ColibriDiu(slot,revision,data,context))
        | 10 => driver.register( slot, ColibriRs485u(slot,revision,data,context))
        end
      end
    else
      context(Error) and context.log(Error, "Unable to instantiate card"  )
    end

interface val ColibriExpansionCardListener
  fun val notify( value:Linkable )

trait tag ColibriExpansionCard
  be update()
  be add_listener( listener:ColibriExpansionCardListener )
  be remove_listener( listener:ColibriExpansionCardListener )

class _UpdateHandler is TimerNotify
  let _colibri7:Colibri7
  var _counter:U64 = 1000000

  new create( colibri':Colibri7 ) =>
    _colibri7 = colibri'

  fun ref apply(timer:Timer, count:U64): Bool =>
    _counter = _counter + 1
    if _counter >= 6000 then // 10 minutes
      _colibri7._find_devices()   // update list of plugged in expansion boards.
      _counter = 0
    end
    _colibri7._update_devices()
    true

class ColibriMultiplexer
  let _context:SystemContext
  let _bus:I2CBus
  let _device:I2CDevice
  let _reset_pin:I32 = 24

  new create( bus':I2CBus, context':SystemContext ) =>
    _bus = bus'
    _context = context'
    _device = I2CDevice(0x70, _bus)
    RPi.pinMode(_reset_pin, OUTPUT)

  fun select(slot:U8) =>
    let mask:U8 = 1 << slot
    _device.write_byte( mask )

  fun reset() =>
    RPi.digitalWrite(_reset_pin, LOW )
    let t':Timer iso = Timer( _RestoreNotify(_reset_pin), 5, 5)
    _context.timers(consume t')

class iso _RestoreNotify is TimerNotify
  let _reset_pin:I32

  new iso create(reset:I32) =>
    _reset_pin = reset

  fun ref apply(timer: Timer ref,count: U64 val): Bool =>
    RPi.digitalWrite(_reset_pin,HIGH)
    false
