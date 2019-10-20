use "../blocks"
use "../blocktypes"
use "../system"
use "collections"
use "debug"
use "jay"
use "logger"
use "ponytest"
use "promises"

actor Assertion is Block
  let _name: String
  let _descriptor: BlockTypeDescriptor
  let _equality: Input[Linkable]
  let _completed: Input[Bool]
  let _context:SystemContext
  let _helper:TestHelper
  var _success: Bool = true
  var _event_counter: USize = 0
  let _expectations:Array[Linkable] = Array[Linkable]
  
  new create(name: String, descriptor': BlockTypeDescriptor, context:SystemContext, helper:TestHelper ) =>
    context(Fine) and context.log("create("+name+")")
    _helper = helper
    _context = context
    _name = name
    _descriptor = descriptor'
    let zero = "0"
    _equality = InputImpl[Linkable]( name, _descriptor.input(0), zero )
    _completed = InputImpl[Bool]( name, _descriptor.input(2), false )

  be start() =>
    _context(Fine) and _context.log("start()")
    
  be stop() =>
    _context(Fine) and _context.log("stop()")
    
  be connect( output: String, to_block: Block, to_input: String) =>
    None
    
  be update(input: String, new_value: Linkable) =>
    Debug(["Assertions.update()"; input; new_value.string()])
    if input == "equals" then
      try
        let expected:Linkable = _expectations(_event_counter)?
        match (new_value, expected)
        | (let actual: Bool, let expect: Bool ) => _helper.assert_eq[Bool]( expect, actual )
        | (let actual: Number, let expect: Number ) => _helper.assert_eq[F64]( expect.f64(), actual.f64() )
        | (let actual: String, let expect: String ) => _helper.assert_eq[String]( expect, actual )
        else
          _success = false
          var atype = type_of( new_value )
          var etype = type_of( expected )
          _helper.fail("Expected " + etype + " " + expected.string() 
                     + ", but got " + atype + " " + new_value.string() 
                     + " in event " + _event_counter.string() ) 
        end
      else
        _success = false
        _helper.fail("More events than expected." )
      end
    end
    
    if input == "completed" then
      _helper.complete(_success)
    end
    
  fun type_of( value: Linkable ): String =>
    match value
    | let s: Bool => "Bool"
    | let s: Number => "Number"
    | let s: String => "String"
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

  be add_expectation( expected: Linkable ) =>
    _expectations.push( expected )

class val AssertionDescriptor is BlockTypeDescriptor
  let equality:InputDescriptor
  let completed:InputDescriptor

  new val create() =>
      equality = InputDescriptor("equality", Num, "value to assert", false, true )
      completed = InputDescriptor("completed", Num, "signal that testing is done and to be evaluated", false, true )

  fun val inputs(): Array[InputDescriptor] val =>
    [ equality; completed ]

  fun val outputs(): Array[OutputDescriptor] val =>
    []
    
  fun val input( index: USize ): InputDescriptor val =>
    try
      let inputs':Array[InputDescriptor] val = inputs()
      inputs'(index)?
    else
      InputDescriptor( "INVALID", Num, "INVALID", false, false)
    end
    
  fun val output( index: USize ): OutputDescriptor val =>
    OutputDescriptor( "INVALID", Num, "INVALID", false, false)
    
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

  fun create_block( instance_name: String, context:SystemContext val):Block =>
    context(Fine) and context.log("create Assertion")
    Assertion( instance_name, _descriptor, context, helper )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
