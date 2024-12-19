
use "../../system"
use "../../blocktypes"
use "../../graphs"
use ".."

actor Emulator is Driver
  new create(context':SystemContext, blocktypes':BlockTypes) =>
      blocktypes'.add_driver_blocktype( CyclicBlockFactory( "emulator/GpioOut", "", "Reads GPIO pin from the emulator console",
                                          EmulGpioInputAlgorithm,
                                          100,
                                          [ InputDescriptor( "pin", "number", "GPIO pin to read" ) ],
                                          [ OutputDescriptor( "out", "bool", "true when GPIO console pin is HIGH, false otherwise" ) ]
                                      ))
      blocktypes'.add_driver_blocktype( GenericBlockFactory( "emulator/GpioOut", "", "Sets GPIO pin in the emulator console",
                                          EmulGpioOutputAlgorithm,
                                          [
                                            InputDescriptor( "pin", "number", "GPIO pin to write" )
                                            InputDescriptor( "in", "bool", "value to write to GPIO pin. true -> HIGH, false -> LOW" )
                                          ],
                                          []
                                      ))

  be start() =>
    None

  be stop() =>
    None
