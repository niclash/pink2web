
# Compiling for Raspberry Pi

I think these packages are needed.

```bash
# $ apt list | grep installed | grep arm | grep -v automatic
# g++-10-arm-linux-gnueabihf/testing,now 10.2.1-6cross1 amd64 [installed]
# gcc-10-arm-linux-gnueabi/testing,now 10.2.1-6cross1 amd64 [installed]
# gcc-arm-linux-gnueabihf/testing,now 4:10.2.1-1 amd64 [installed]
# openssl/testing,now 1.1.1i-2 armhf [installed]
```

To compile the toolchain;

``` bash
# Clone the Pony compiler
git clone https://github.com/ponylang/ponyc ponyc-arm
cd ponyc-arm

# Build the (partial) LLVM toolchain
make libs build_flags=-j8 llvm_archs="X86;ARM"

# Configure Ponyc compilation
make configure

# Build the ponyc binary
make build build_flags=-j8

# Build the pony runtime library
make cross-libponyrt CC=arm-linux-gnueabihf-gcc-10 CXX=arm-linux-gnueabihf-g++-10 arch=armv8-a tune=cortex-a53 llc_arch=arm
```
The above is only needed once.

And finally the steps to run for each change in the `pink2web` executable.
```bash 
#Compile the application
export CC="/usr/bin/arm-linux-gnueabihf-gcc -mfloat-abi=hard -mfpu=fp-armv8 -lwiringPi"
cd ../pink2web
corral run -- ponyc -Dwiringpi -Di2c -Dopenssl_1.1.x --cpu=cortex-a53 --triple="arm-unknown-linux-gnueabihf" --link-arch=armv8-a
```
