
use "collections"
use "../../blocktypes"
use "../../graphs"
use "../../system"
use ".."

actor RaspberryPi is Driver

  new create(context':SystemContext, blocktypes':BlockTypes) =>
      blocktypes'.add_driver_blocktype( CyclicBlockFactory( "raspi/GpioIn", "Reads GPIO pin on the hardware",
                                          GpioInputAlgorithm, 100,
                                          [ InputDescriptor( "pin", "number", "GPIO pin to read" ) ],
                                          [ OutputDescriptor( "out", "bool", "true when GPIO pin is HIGH, false otherwise" ) ]
                                      ))

      blocktypes'.add_driver_blocktype( GenericBlockFactory( "raspi/GpioOut", "Sets GPIO pin on the hardware",
                                          GpioOutputAlgorithm,
                                          [ InputDescriptor( "pin", "number", "GPIO pin to read" ); InputDescriptor( "in", "bool", "value to write to GPIO pin. true -> HIGH, false -> LOW" ) ],
                                          []
                                      ))

  be start() =>
    None

  be stop() =>
    None

  fun _add_component(factory:BlockFactory, types': Map[String,BlockFactory]) =>
    types'(factory.block_type_descriptor().name()) = factory

