use "../graphs"
use "../blocktypes"
use "../system"
use "collections"
use "debug"
use "jay"
use "logger"
use "ponytest"
use "promises"

actor Assertion is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _equality: Input[Linkable]
  let _completed: Input[Bool]
  let _context:SystemContext
  let _helper:TestHelper
  let _expectations:Array[Array[Linkable] val] = []
  
  var _success: Bool = true
  var _counter: USize = 0
  var _sub_counter:ISize = -1
  var _started:Bool = false
  var _feed:Array[(String,String)] val = []
  var _graph: (Graph|None) = None
  
  new create(name': String, descriptor': BlockTypeDescriptor, context:SystemContext, helper:TestHelper ) =>
    context(Fine) and context.log("create("+name'+")")
    _helper = helper
    _context = context
    _name = name'
    _descriptor = descriptor'
    let zero = "0"
    _equality = InputImpl[Linkable]( name', _descriptor.input(0), zero )
    _completed = InputImpl[Bool]( name', _descriptor.input(2), false )

  be run(inputs:Array[(String,String)] val, graph:Graph) =>
    _context(Fine) and _context.log( "Starting data feed" )
    _feed = inputs
    _graph = graph
    try
      next_input()?
    else
      _helper.fail("No inputs in testing protocol")
    end

  fun next_input()? =>
    match _graph
    | let graph':Graph => 
      (let point, let value) = _feed(_counter)?
      _context(Fine) and _context.log( "next_input() " + _counter.string() + "  " +  point + " = " + value )
      graph'.set_value_from_string( point, value )
    else
      None // Ignore as this happens (or may happen) during start up.
    end
    
  fun ref next_expectation(): Linkable ? =>
    let expectation = _expectations(_counter)?
    if( _sub_counter == -1 ) then 
      _sub_counter = 0
    end
    let value = expectation(_sub_counter.usize())?
    _sub_counter = _sub_counter + 1
    if _sub_counter.usize() >= expectation.size() then
      _sub_counter = -1
      _counter = _counter + 1
    end
    value
    
  be start() =>
    _started = true
    _context(Fine) and _context.log("start()")
    
  be stop() =>
    _started = false  
    _context(Fine) and _context.log("stop()")
    
  be connect( output: String, to_block: Block, to_input: String) =>
    None
    
  be disconnect_block( block: Block ) =>
    None

  be disconnect_edge( output:String, dest_block: Block, dest_input: String ) =>
    None

  be destroy() =>
    refresh()
    _started = false
    
  be rename( new_name: String ) =>
    _name = new_name
    
  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be change( x:I64, y:I64 ) =>
    None
    
  be update(input: String, new_value: Linkable) =>
    if _graph is None then
      return
    end
    _context(Fine) and _context.log("Assertion[ " + _name + "." + input + " = " + new_value.string() + " ]")
    if input == "equality" then
      try
        let expected:Linkable = next_expectation()?
        
        match (new_value, expected)
        | (let actual: Bool, let expect: Bool ) => _helper.assert_eq[Bool]( expect, actual, "[event " + _counter.string() + "]" )
        | (let actual: Number, let expect: Number ) => _helper.assert_eq[F64]( expect.f64(), actual.f64(), "[event " + _counter.string() + "]" )
        | (let actual: String, let expect: String ) => _helper.assert_eq[String]( expect, actual, "[event " + _counter.string() + "]" )
        else
          _success = false
          var atype = type_of( new_value )
          var etype = type_of( expected )
          _helper.fail("Expected " + etype + " " + expected.string() 
                     + ", but got " + atype + " " + new_value.string() 
                     + " in event " + _counter.string() ) 
        end
        try
          next_input()?
        else
          // We are out of input data. Time to consolidate
          try
            let additional_expected = next_expectation()?
            _helper.fail("Some expected outputs didn't arrive.")
            _success = false
          else
            None // Expected that no more expectations exist
          end
          _helper.complete(_success)
        end
      else
        _helper.fail("Not enough expected outputs." )
        _helper.complete(false)
      end
    end
    
  fun type_of( value: Linkable ): String =>
    match value
    | let s: None => "nil"
    | let s: Bool => "bool"
    | let s: Real => "real"
    | let s: String => "text"
    end

  be refresh() =>
    None
    
  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    _context(Fine) and _context.log("describe")
    let equality = _equality.describe()
    let completed = _completed.describe()
    let m = JObj
      + ("name", _name )
      + ("equality", equality )
      + ("completed", completed )
    _context(Fine) and _context.log( "Reporting " + m.string() )
    promise(m)

  be add_expectation( expected: Array[Linkable] val) =>
    _expectations.push( expected )

class val AssertionDescriptor is BlockTypeDescriptor
  let equality:InputDescriptor
  let completed:InputDescriptor

  new val create() =>
      equality = InputDescriptor("equality", PReal, "value to assert", false, true )
      completed = InputDescriptor("completed", PReal, "signal that testing is done and to be evaluated", false, true )

  fun val inputs(): Array[InputDescriptor] val =>
    [ equality; completed ]

  fun val outputs(): Array[OutputDescriptor] val =>
    []
    
  fun val input( index: USize ): InputDescriptor val =>
    try
      let inputs':Array[InputDescriptor] val = inputs()
      inputs'(index)?
    else
      InputDescriptor( "INVALID", PReal, "INVALID", false, false)
    end
    
  fun val output( index: USize ): OutputDescriptor val =>
    OutputDescriptor( "INVALID", PReal, "INVALID", false, false)
    
  fun val name(): String =>
    "Assertion"
    
  fun val description(): String =>
    "Asserts that a list of expected values arrive on its 'equality' input."
    

class val AssertionFactory is BlockFactory 
  let _descriptor: AssertionDescriptor val = recover AssertionDescriptor end
  let helper:TestHelper
  
  new val create(helper':TestHelper) => 
    helper = helper'

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log("create Assertion")
    Assertion( instance_name, _descriptor, context, helper )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
