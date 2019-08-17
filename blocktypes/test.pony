use "ponytest"
use "logger"

actor Tests is TestList 
  
  new create(env: Env) => 
    PonyTest(env, this)
    
  new make() => 
    None

  fun tag tests(test: PonyTest) =>
    test(_AddBlockTest)

actor TestBlock is Block
  let _input: Input[F64] iso
  
  new create(input: Input[F64] iso) =>
    _input = consume input

  be connect( output: String val, to_block: Block tag, to_input: String val) =>
    None // ignore
  
  be update[TYPE: Any val](input: String val, newValue: TYPE  val) =>
    match newValue
    | let v: F64 => 
        if input == "input" then
          _input.set( v )
        end
    end

  be refresh() =>
    None
    
  be updateWithName[TYPE: Any val](input: String val, newValue: TYPE  val) =>
    None // ignore
    

class TestInput[TYPE: Comparable[TYPE] val] is Input[TYPE]
  var _expected: TYPE val
  var _helper: TestHelper
  var _value: TYPE val
  
  new create(expected: TYPE, h: TestHelper, initialValue: TYPE ) =>
    _expected = consume expected
    _helper = consume h
    _value = consume initialValue
    
  fun ref set( newValue: TYPE) =>
    _value = newValue
    if _expected == newValue then
        _helper.complete(true)
    end
    
  fun value() : this->TYPE =>
    _value


class iso _AddBlockTest is UnitTest
  fun name(): String => "test AddBlock"

  fun apply(h: TestHelper) =>
    let block = TestBlock(recover iso TestInput[F64](18.0, h, 0.0) end)
    let logger:Logger[String val] val = recover val StringLogger(Fine, h.env.out) end
    let b1 = AddBlock( "block1", logger )
    let b2 = AddBlock( "block2", logger )
    let b3 = AddBlock( "block3", logger )
    
    b1.connect( "output", b3, "input1" )
    b2.connect( "output", b3, "input2" )
    b3.connect( "output", block, "input" )
    
    b1.update[F64]( "input1", 3.0 )
    b1.update[F64]( "input2", 4.0 )
    b2.update[F64]( "input1", 5.0 )
    b2.update[F64]( "input2", 6.0 )
    h.long_test(2_000_000_000)
    

  fun timed_out(h: TestHelper) =>
    h.complete(false)

