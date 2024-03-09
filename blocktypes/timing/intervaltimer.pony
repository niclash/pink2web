use "collections"
use "debug"
use "jay"
use "metric"
use "promises"
use "time"
use ".."
use "../../graphs"
use "../../system"

actor IntervalTimerBlock is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _interval: Input
  let _initial: Input
  let _run': Input
  let _oneshot: Input
  let _output: Output
  let _context:SystemContext
  var timer: (Timer tag|None) = None
  var _started:Bool = false
  var _x:I64
  var _y:I64
  var _time_since_last_eventrate_update:I64 = PosixDate.time()
  var _eventcounter: I32 = 0
  var _eventrate: F32 = -1

  new create(name': String, descriptor': BlockTypeDescriptor, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log(Fine, "create("+name'+")")
    _context = context
    _name = name'
    _descriptor = descriptor'
    _x = x
    _y = y
    _interval = InputImpl( _name, _descriptor.input(0) )
    _interval.set( F64(500) ) // 0.5 sec
    _initial = InputImpl( _name, _descriptor.input(1) )
    _initial.set( F64(500) ) // 0.5 sec
    _run' = InputImpl( _name, _descriptor.input(2) )
    _oneshot = InputImpl( _name, _descriptor.input(2) )
    _output = OutputImpl( _name, _descriptor.output(0) )

  be change( x:I64, y:I64 ) =>
    _x = x
    _y = y

  be get_input(input: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    match input
    | "interval" => promise(_interval.value())
    | "run" => promise(_run'.value())
    | "oneshot" => promise(_oneshot.value())
    | "initial" => promise(_initial.value())
    else
      _context(Warn) and _context.log( Warn, "Unknown input: " + _name + "." + input )
      false
    end

  be get_output(output: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    if output == "out"  then
      promise(_output.value())
    else
      _context(Error) and _context.log(Error, output + " is not an output name of block type " + _descriptor.name() )
      false
    end

  be _notify() =>
    if ToBool(_oneshot.value()) then
      _started = false
      stop()
    else
      _output.set( not ToBool(_output.value()) )
    end

  be start() =>
    _start()

  fun ref _start() =>
    _context(Fine) and _context.log(Fine, "start()")
    if not _started then
      _started = true
      _arm(ToU64(_initial.value()),ToU64(_interval.value()))
    end

  be stop() =>
    _stop()

  fun ref _stop() =>
    _refresh()
    _context(Fine) and _context.log(Fine, "stop()")
    if _started then
      _started = false
      match timer
      | let t:Timer tag => _context.timers.cancel(t)
      end
      timer = None
    end

  fun ref _arm(initial:U64, interval:U64) =>
    Debug.out("arm(" + initial.string() + ", " + interval.string() + ")" )
    let it:IntervalTimerBlock tag = this
    let t':Timer iso = Timer( TimerHandler(it, ToBool(_oneshot.value())), initial * 1000000, interval * 1000000) // scale to milliseconds.
    timer = t'
    _context.timers(consume t')

  fun ref _rearm() =>
    Debug.out("_rearm()")
    _stop()
    _start()

  be connect( output: String, to_block: Block, to_input: String) =>
    if output == "out"  then
      _output.connect(to_block, to_input)
    end
    _refresh()

  be disconnect_block( block: Block, disconnects: LinkRemoveNotify ) =>
    _output.disconnect_block( block, disconnects )

  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify ) =>
    match output
    | "out" => _output.disconnect_edge( dest_block, dest_input, disconnects )
    end

  be destroy(disconnects: LinkRemoveNotify) =>
    _refresh()
    _context(Fine) and _context.log(Fine, "destroy()")
    _started = false
    _output.disconnect_all(disconnects)

  be rename( new_name: String ) =>
    _output.rename_of_block( this, _name, new_name )
    _name = new_name

  be rename_of( block: Block, old_name: String, new_name: String ) =>
    _interval.rename_of_block( block, old_name, new_name )
    _initial.rename_of_block( block, old_name, new_name )
    _run'.rename_of_block( block, old_name, new_name )
    _oneshot.rename_of_block( block, old_name, new_name )
    _output.rename_of_block( block, old_name, new_name )

  be update(input: String, new_value:(String|I64|F64|Metric|Bool)) =>
    _eventcounter = _eventcounter + 1
    match new_value
    | let v:Stringable => _context(Fine) and _context.log(Fine, "IntervalTimer[ " + _name + "." + input + " = " + v.string() + " ]")
    end
    match new_value
    | let v: F64 =>
      if input == "interval" then _interval.set( v ) end
      if input == "initial" then _initial.set( v ) end
      if input == "run" then _run'.set( ToBool(v) ) end
      if input == "oneshot" then _oneshot.set( ToBool(v) ) end
    | let v: Bool =>
      if input == "run" then _run'.set( v ) end
      if input == "oneshot" then _oneshot.set( v ) end
    | let v: String =>
      if input == "interval" then _interval.set( ToF64(v) ) end
      if input == "run" then _run'.set( ToBool(v) ) end
      if input == "oneshot" then _oneshot.set( ToBool(v) ) end
      if input == "initial" then _initial.set( ToF64(v) ) end
    end

  be stats_update() =>
    let now = PosixDate.time()
    let interval_in_seconds = now - _time_since_last_eventrate_update
    _eventrate = _eventcounter.f32() / interval_in_seconds.f32()
    _time_since_last_eventrate_update = now

  be set_initial(input: String, initial_value:(String|I64|F64|Metric|Bool|None)) =>
    _context(Fine) and _context.log(Fine, "IntervalTimer[ " + _name + "." + input + " = " + initial_value.string() + " ]")
    match initial_value
    | let v: F64 =>
      if input == "interval" then _interval.set_initial( v ) end
      if input == "initial" then _initial.set_initial( v ) end
      if input == "run" then _run'.set_initial( ToBool(v) ) end
      if input == "oneshot" then _oneshot.set_initial( ToBool(v) ) end
    | let v: Bool =>
      if input == "run" then _run'.set_initial( v ) end
      if input == "oneshot" then _oneshot.set_initial( v ) end
    | let v: String =>
      if input == "interval" then _interval.set_initial( ToF64(v) ) end
      if input == "initial" then _initial.set_initial( ToF64(v) ) end
      if input == "run" then _run'.set_initial( ToBool(v) ) end
      if input == "oneshot" then _oneshot.set_initial( ToBool(v) ) end
    end

  be refresh() =>
    _refresh()

  fun _refresh() =>
    None

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    BlockDescription(promise, _name, _descriptor.name(), _started, [_interval; _run'; _oneshot; _initial], [_output] )

  be subscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "interval" => _interval.subscribe(subscription)
    | "initial" =>  _initial.subscribe(subscription)
    | "run" =>    _run'.subscribe(subscription)
    | "oneshot" =>  _oneshot.subscribe(subscription)
    end
    _refresh()

  be unsubscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "interval" => _interval.unsubscribe(subscription)
    | "initial" =>  _initial.unsubscribe(subscription)
    | "run" =>    _run'.unsubscribe(subscription)
    | "oneshot" =>  _oneshot.unsubscribe(subscription)
    end
    _refresh()

class val IntervalTimerBlockDescriptor is BlockTypeDescriptor
  let _interval:InputDescriptor
  let _initial:InputDescriptor
  let _run:InputDescriptor
  let _oneshot:InputDescriptor
  let _out:OutputDescriptor

  new val create() =>
      _interval = InputDescriptor("interval", "number", "interval after the initial interval", false )
      _initial = InputDescriptor("initial", "number", "first interval", false )
      _run = InputDescriptor("run", "bool", "run/stop of timer", false )
      _oneshot = InputDescriptor("oneshot", "bool", "true if only one count sequence to run", false )
      _out = OutputDescriptor("out", "bool", "true when timer expired, false when timer counting", false )

  fun val inputs(): Array[InputDescriptor] val =>
    [ _interval; _initial; _run; _oneshot ]

  fun val outputs(): Array[OutputDescriptor] val =>
    [ _out ]

  fun interval(): InputDescriptor => _interval

  fun initial(): InputDescriptor => _initial

  fun run(): InputDescriptor => _run

  fun oneshot(): InputDescriptor => _oneshot

  fun out(): OutputDescriptor => _out

  fun val input( index: USize ): InputDescriptor val =>
    match index
    | 0 => _interval
    | 1 => _initial
    | 2 => _run
    | 3 => _oneshot
    else
      InputDescriptor( "INVALID", "number", "INVALID", false)
    end

  fun val output( index: USize ): OutputDescriptor val =>
    match index
    | 0 => _out
    else
      OutputDescriptor( "INVALID", "number", "INVALID", false)
    end

  fun val icon(): String =>
    "timer"

  fun val name(): String =>
    "timing/Interval"

  fun val description(): String =>
    "Timer for generation of timing pulses."


class val IntervalTimerBlockFactory is BlockFactory
  let _descriptor: IntervalTimerBlockDescriptor val = recover IntervalTimerBlockDescriptor end

  new val create() => None

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log(Fine, "create IntervalTimer")
    IntervalTimerBlock( instance_name, _descriptor, context, x, y )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )

class TimerHandler is TimerNotify
  let _timer:IntervalTimerBlock tag
  let _oneshot:Bool

  new iso create(timer:IntervalTimerBlock tag, oneshot':Bool ) =>
    _timer = timer
    _oneshot = oneshot'

  fun ref apply(timer:Timer, count:U64): Bool =>
    _timer._notify()
    not _oneshot
