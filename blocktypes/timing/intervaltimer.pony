use "collections"
use "jay"
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
  let _rearm': Input
  let _oneshot: Input
  let _output: Output
  let _context:SystemContext
  var timer: (Timer tag|None) = None
  var _started:Bool = false
  var _x:I64
  var _y:I64

  new create(name': String, descriptor': BlockTypeDescriptor, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log(Fine, "create("+name'+")")
    _context = context
    _name = name'
    _descriptor = descriptor'
    _x = x
    _y = y
    _interval = InputImpl( _name, _descriptor.input(0), F64(1000) )
    _initial = InputImpl( _name, _descriptor.input(1), F64(1000) )
    _rearm' = InputImpl( _name, _descriptor.input(2), false )
    _oneshot = InputImpl( _name, _descriptor.input(2), false )
    _output = OutputImpl( _name, _descriptor.output(0), false )

  be change( x:I64, y:I64 ) =>
    _x = x
    _y = y

  be _notify() =>
    if ToBool(_oneshot.value()) then
      _started = false
      stop()
    else
      _output.set( ToBool(_output.value()) xor true )
    end

  be start() =>
    _context(Fine) and _context.log(Fine, "start()")
    if not _started then
      _started = true
      _arm(ToU64(_initial.value()),ToU64(_initial.value()))
    end

  be stop() =>
    refresh()
    _context(Fine) and _context.log(Fine, "stop()")
    if _started then
      _started = false
      match timer
      | let t:Timer tag => _context.timers().cancel(t)
      end
      timer = None
    end

  fun ref _arm(initial:U64, interval:U64) =>
    Print("arm" + initial.string() + ", " + interval.string() )
    let it:IntervalTimerBlock tag = this
    let t':Timer iso = Timer( TimerHandler(it), initial, interval)
    timer = t'
    _context.timers()(consume t')

  fun ref _rearm() =>
    match timer
    | let t:None => start()
    | let t:Timer tag =>
      stop()
      _arm(ToU64(_interval.value()),ToU64(_initial.value()))
      _rearm'.set(false)
    end

  be connect( output: String, to_block: Block, to_input: String) =>
    if output == "out"  then
      _output.connect(to_block, to_input)
    end
    refresh()

  be disconnect_block( block: Block, disconnects: LinkRemoveNotify ) =>
    _output.disconnect_block( block, disconnects )

  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify ) =>
    match output
    | "out" => _output.disconnect_edge( dest_block, dest_input, disconnects )
    end

  be destroy(disconnects: LinkRemoveNotify) =>
    refresh()
    _context(Fine) and _context.log(Fine, "destroy()")
    _started = false
    _output.disconnect_all(disconnects)

  be rename( new_name: String ) =>
    _name = new_name

  be update(input: String, new_value:Any val) =>
    match new_value
    | let v:Stringable => _context(Fine) and _context.log(Fine, "IntervalTimer[ " + _name + "." + input + " = " + v.string() + " ]")
    end
    match new_value
    | let v: F64 =>
      if input == "interval" then _interval.set( v ) end
      if input == "initial" then _initial.set( v ) end
    | let v: Bool =>
      if input == "rearm" then if v then _rearm() end  end
      if input == "oneshot" then _oneshot.set( v ) end
    | let v: String =>
      if input == "interval" then _interval.set( ToF64(v) ) end
      if input == "rearm" then if v == "true" then _rearm() end end
      if input == "oneshot" then _oneshot.set( v == "true" ) end
      if input == "initial" then _initial.set( ToF64(v) ) end
    end

  be set_initial(input: String, initial_value:Any val) =>
    match initial_value
    | let v:Stringable => _context(Fine) and _context.log(Fine, "IntervalTimer[ " + _name + "." + input + " = " + v.string() + " ]")
    end
    match initial_value
    | let v: F64 =>
      if input == "interval" then _interval.set_initial( v ) end
      if input == "initial" then _initial.set_initial( v ) end
    | let v: Bool =>
      if input == "rearm" then if v then _rearm() end  end
      if input == "oneshot" then _oneshot.set_initial( v ) end
    | let v: String =>
      if input == "interval" then _interval.set_initial( ToF64(v) ) end
      if input == "rearm" then if v == "true" then _rearm() end end
      if input == "oneshot" then _oneshot.set_initial( v == "true" ) end
      if input == "initial" then _initial.set_initial( ToF64(v) ) end
    end

  be refresh() =>
    None

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    BlockDescription(promise, _name, _descriptor.name(), _started, [_interval; _rearm'; _oneshot; _initial], [_output] )

  be subscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "interval" => _interval.subscribe(subscription)
    | "initial" =>  _initial.subscribe(subscription)
    | "rearm" =>    _rearm'.subscribe(subscription)
    | "oneshot" =>  _oneshot.subscribe(subscription)
    end
    refresh()

  be unsubscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "interval" => _interval.unsubscribe(subscription)
    | "initial" =>  _initial.unsubscribe(subscription)
    | "rearm" =>    _rearm'.unsubscribe(subscription)
    | "oneshot" =>  _oneshot.unsubscribe(subscription)
    end
    refresh()

class val IntervalTimerBlockDescriptor is BlockTypeDescriptor
  let _interval:InputDescriptor
  let _initial:InputDescriptor
  let _rearm:InputDescriptor
  let _oneshot:InputDescriptor
  let _out:OutputDescriptor

  new val create() =>
      _interval = InputDescriptor("interval", "number", "interval after the initial interval", false )
      _initial = InputDescriptor("initial", "number", "first interval", false )
      _rearm = InputDescriptor("rearm", "bool", "restart counting sequence", false )
      _oneshot = InputDescriptor("oneshot", "bool", "true if only one count sequence to run", false )
      _out = OutputDescriptor("out", "bool", "true when timer expired, false when timer counting", false )

  fun val inputs(): Array[InputDescriptor] val =>
    [ _interval; _initial; _rearm; _oneshot ]

  fun val outputs(): Array[OutputDescriptor] val =>
    [ _out ]

  fun interval(): InputDescriptor => _interval

  fun initial(): InputDescriptor => _initial

  fun rearm(): InputDescriptor => _rearm

  fun oneshot(): InputDescriptor => _oneshot

  fun out(): OutputDescriptor => _out

  fun val input( index: USize ): InputDescriptor val =>
    match index
    | 0 => _interval
    | 1 => _initial
    | 2 => _rearm
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

  new iso create(timer:IntervalTimerBlock tag ) =>
    _timer = timer

  fun ref apply(timer:Timer, count:U64): Bool =>
    _timer._notify()
    true
