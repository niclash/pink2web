use "collections"
use "files"
use "raspi"
use "time"
use "../../blocktypes"
use "../../system"
use ".."

actor Link2Web is Driver
  let _multiplexer:Link2WebMultiplexer
  let _expansions:Map[U8, ExpansionCard] = Map[U8,ExpansionCard]
  let _context:SystemContext
  let _blocktypes:BlockTypes
  let _bus:I2CBus

  new create(context':SystemContext, blocktypes':BlockTypes) =>
    _context = context'
    _blocktypes = blocktypes'
    _bus = I2C.bus(0, FileAuth(context'.auth()) )
    _multiplexer = Link2WebMultiplexer(_bus, context')

  be start() =>
    _find_devices()

  be stop() => None

  be _find_devices() =>
    var slot:U8 = 0
    while slot < 8 do
      _multiplexer.select(slot)
      let eeprom = I2CDevice(0x50,_bus)
      let driver':Link2Web tag = this
      eeprom.read_bytes(256, { (data, status) =>
        match status
        | I2COk => Link2WebExpansionFactory.createFactory(slot, data, _context, driver')
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

  be register(slot:U8, expansion:ExpansionCard) =>
    _expansions(slot) = expansion


primitive Link2WebExpansionFactory
  fun createFactory(slot:U8, data:Array[U8] val, context:SystemContext, driver:Link2Web) =>
    try
      let manufacturer:U16 = (data(0)?).u16() + ((data(1)?).u16() * 256)
      let device:U16 = (data(2)?).u16() + ((data(3)?).u16() * 256)
      let revision:U16 = (data(4)?).u16() + ((data(5)?).u16() * 256)
      if manufacturer == 0  then // Bali Automation
        match device
        | 1 => driver.register( slot, Link2WebAq(slot,revision,data,context))
        | 2 => driver.register( slot, Link2WebFallback(slot,revision,data,context))
        | 3 => driver.register( slot, Link2WebAi(slot,revision,data,context))
        | 4 => driver.register( slot, Link2WebTriac(slot,revision,data,context))
        | 5 => driver.register( slot, Link2WebPt1000(slot,revision,data,context))
        | 6 => driver.register( slot, Link2WebRelay(slot,revision,data,context))
        | 7 => None // Link2WebLora(slot,data,context) never got produced
        | 8 => driver.register( slot, Link2WebRtd(slot,revision,data,context))
        | 9 => driver.register( slot, Link2WebDi(slot,revision,data,context))
        | 10 => driver.register( slot, Link2WebU485(slot,revision,data,context))
        end
      end
    else
      context(Error) and context.log(Error, "Unable to instantiate card"  )
    end

interface val ExpansionCardListener
  fun val notify( value:Any val )

trait tag ExpansionCard
  be update()
  be add_listener( listener:ExpansionCardListener )
  be remove_listener( listener:ExpansionCardListener )

class _UpdateHandler is TimerNotify
  let _link2web:Link2Web
  var _counter:U64 = 1000000

  new create( link2web':Link2Web ) =>
    _link2web = link2web'

  fun ref apply(timer:Timer, count:U64): Bool =>
    _counter = _counter + 1
    if _counter >= 6000 then // 10 minutes
      _link2web._find_devices()   // update list of plugged in expansion boards.
      _counter = 0
    end
    _link2web._update_devices()
    true

class Link2WebMultiplexer
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
    _context.timers()(consume t')

class iso _RestoreNotify is TimerNotify
  let _reset_pin:I32

  new iso create(reset:I32) =>
    _reset_pin = reset

  fun ref apply(timer: Timer ref,count: U64 val): Bool =>
    RPi.digitalWrite(_reset_pin,HIGH)
    false
