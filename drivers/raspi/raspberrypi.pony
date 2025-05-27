
use "collections"
use "raspi"
use "../../blocktypes"
use gr = "../../graphs"
use "../../system"
use ".."

actor RaspberryPi is Driver

  new create(context':SystemContext, blocktypes':BlockTypes) =>
      RPi.wiringPiSetup()

      blocktypes'.add_driver_blocktype( CyclicBlockFactory( "raspi/GpioIn", "", "Reads GPIO pin on the hardware",
                                          RaspiGpioInputAlgorithm, 100,
                                          [ gr.InputDescriptor( "pin", "number", "GPIO pin to read" ) ],
                                          [ gr.OutputDescriptor( "out", "bool", "true when GPIO pin is HIGH, false otherwise" ) ]
                                      ))

      blocktypes'.add_driver_blocktype( GenericBlockFactory( "raspi/GpioOut", "", "Sets GPIO pin on the hardware",
                                          RaspiGpioOutputAlgorithm,
                                          [ gr.InputDescriptor( "pin", "number", "GPIO pin to read" )
                                            gr.InputDescriptor( "in", "bool", "value to write to GPIO pin. true -> HIGH, false -> LOW" )
                                          ],
                                          []
                                      ))

  be start() =>
    None

  be stop() =>
    None

  fun _add_component(factory:gr.BlockFactory, types': Map[String,gr.BlockFactory]) =>
    types'(factory.block_type_descriptor().name()) = factory

