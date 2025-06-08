use "collections"
use "files"
use "promises"
use "gpiod"
use "i2c"
use "time"
use "../../system"
use ".."

// NOTE!!!!!!!!!!!!!!!!!!
// This driver is ONLY copied from the Link2Web driver and changed the names. NOTHING ELSE has been considered or fixed to make it work on Colibri yet.

actor Colibri7 is Driver
  let _drivers:Drivers
  let _multiplexer:(Colibri7Multiplexer | None)
  let _expansions:Map[U8, ColibriExpansionCard] = Map[U8,ColibriExpansionCard]
  let _context:SystemContext
  let _bus:I2CBus
  let _config:Map[String,String] val
  let _gpio:(None|GpioChip val)

  new create(context':SystemContext, config':Map[String,String] val, drivers':Drivers) =>
    _drivers = drivers'
    _context = context'
    _config = config'
    let pinnumber:USize = try _config("reset_pin")?.usize()? else 19 end
    let chipname = try _config("gpiochip")? else "gpiochip0" end
    _bus = I2C.bus(0, FileAuth(context'.auth()) )
    try
      let gpio = recover val GpioChip(chipname)? end
      let reset_pin = recover val
        let cfg = GpioLineConfig.create()?

        let settings = GpioLineSettings.create()
        settings.set_direction(GpioLineDirectionOutput)
        if cfg.add_line_settings([pinnumber], settings) == -1 then error end

        let request = GpioRequestConfig.create()?
        request.set_event_buffer_size(0)
        request.set_consumer(_context.name())
        gpio.request_lines(request, cfg)?
      end
      _gpio = gpio
      _multiplexer = Colibri7Multiplexer(_bus, reset_pin, context')
    else
      context'(Error) and context'.log(Error, "Unable to instantiate driver: " + context'.formatMap(config')  )
      _multiplexer = None
      _gpio = None
    end

  be start() =>
    _find_devices()

  be stop() => None

  be _find_devices() =>
    match _multiplexer
    | let multi:Colibri7Multiplexer =>
      var slot:U8 = 0
      while slot < 8 do
        multi.select(slot)
        let eeprom = I2CDevice(0x50,_bus)
        let driver':Colibri7 tag = this
        eeprom.read_bytes(256, { (data, status) =>
          match status
          | I2COk => Colibri7ExpansionFactory.createFactory(slot, data, _context, driver')
          | I2COpenError => _context(Error) and _context.log(Error, "I2C: Device is already opened" )
          | I2CNotOpenError => _context(Error) and _context.log(Error, "I2C: Device is not opened" )
          | I2CWriteError => _context(Error) and _context.log(Error, "I2C: Write Error" )
          | I2CReadError => _context(Error) and _context.log(Error, "I2C: Read Error" )
          | I2CUnknownError => _context(Error) and _context.log(Error, "I2C: Unknown Error" )
          end
        })
        slot = slot + 1
      end
    end

  be _update_devices() =>
    None

  be register(slot:U8, expansion:ColibriExpansionCard) =>
    _expansions(slot) = expansion

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

primitive Colibri7ExpansionFactory
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

interface val ColibriExpansionCardNotify
  fun val notify( value:Linkable )

trait tag ColibriExpansionCard
  be update()
  be add_listener( listener:ColibriExpansionCardNotify )
  be remove_listener( listener:ColibriExpansionCardNotify )

class _UpdateHandler is TimerNotify
  let _colibri:Colibri7
  var _counter:U64 = 1000000

  new create( colibri':Colibri7 ) =>
    _colibri = colibri'

  fun ref apply(timer:Timer, count:U64): Bool =>
    _counter = _counter + 1
    if _counter >= 6000 then // 10 minutes
      _colibri._find_devices()   // update list of plugged in expansion boards.
      _counter = 0
    end
    _colibri._update_devices()
    true

class Colibri7Multiplexer
  let _context:SystemContext
  let _bus:I2CBus
  let _device:I2CDevice
  let _reset_pin:GpioLineRequest val

  new create( bus':I2CBus, reset_pin':GpioLineRequest val, context':SystemContext ) =>
    _bus = bus'
    _context = context'
    _reset_pin = reset_pin'
    _device = I2CDevice(0x70, _bus)

  fun select(slot:U8) =>
    let mask:U8 = 1 << slot
    _device.write_byte( mask )

  fun reset() =>
    _reset_pin.set_value(0,GpioLineValueInactive)
    let t':Timer iso = Timer( _RestoreNotify(_reset_pin), 5, 5)
    _context.timers(consume t')

class _RestoreNotify is TimerNotify
  let _reset_pin:GpioLineRequest val

  new iso create(reset:GpioLineRequest val) =>
    _reset_pin = reset

  fun ref apply(timer: Timer ref,count: U64 val): Bool =>
    _reset_pin.set_value(0, GpioLineValueActive)
    false
