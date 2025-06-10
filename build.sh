#!/bin/bash

rm -rf build
if [ "$2." != "--no-frontend." ] ; then
  cd frontend
  npm run build || exit 1
  cd ..
fi

if [ "$1." == "arm." ] ; then
  export CC="/usr/bin/arm-linux-gnueabihf-gcc -mfloat-abi=hard -mfpu=fp-armv8 -lwiringPi"
  corral run -- ponyc -d -Dopenssl_3.0.x --cpu=cortex-a53 --triple="arm-unknown-linux-gnueabihf" --link-arch=armv8-a --linker=arm-linux-gnueabihf-gcc-14 --path "/home/niclas/dev/pony/ponyc-arm/build/armv8-a/release/"
  if [ "$2." == "release." ] ; then
    export VERSION=`git tag | grep ^v | sort -r | head -1 | sed 's/v//' `
    echo "Building pinkweb_$VERSION"
    mkdir -p build/pink2web_$VERSION/
    cd build/pink2web_$VERSION/
    mkdir -p DEBIAN
    mkdir -p etc/systemd/system/
    mkdir -p etc/pink2web/
    mkdir -p usr/bin/
    mkdir -p usr/local/lib/pink2web/bin/
    mkdir -p var/lib/pink2web/processes/
    mkdir -p var/lib/pink2web/hist
    mkdir -p var/lib/pink2web/stores
    mkdir -p var/www/pink2web
    cd -
    echo "Source: pink2web
Section: other
Priority: optional
Maintainer: Niclas Hedhman <niclas@bali.io>
Uploaders:
Version: $VERSION
Standards-Version: 3.8.3
Package: pink2web
Homepage:
Architecture: armhf
Distribution:
Depends: wiringpi, python-serial
Description: pink2web is a block programming platform, intended for IoT and automation systems.
" >build/pink2web_$VERSION/DEBIAN/control

  echo "[Unit]
Description=Pink2Web block programming platform. Contact Bali Automation (https://bali.io) for more information.

[Service]
User=pink2web
Group=nogroup
EnvironmentFile=-/etc/default/pink2web
ExecStart=/usr/local/lib/pink2web/bin/pink2web --info run process --host=0.0.0.0 --startpage=pink2web.html --webdir=/var/www/pink2web /var/lib/pink2web/applications/main.json
Restart=on-failure

[Install]
WantedBy=multi-user.target" >build/pink2web_$VERSION/usr/local/lib/pink2web/bin/pink2web.service

    cp pink2web build/pink2web_$VERSION/usr/local/lib/pink2web/bin/pink2web
    cp -r frontend/dist/* build/pink2web_$VERSION/var/www/pink2web/
    cp -r dist/conf/* build/pink2web_$VERSION/etc/pink2web/
    for FILE in `ls dist/hist | grep -v dummy` ; do cp -r $FILE build/pink2web_$VERSION/var/lib/pink2web/hist/ ; done
    for FILE in `ls dist/stores | grep -v dummy` ; do cp -r $FILE build/pink2web_$VERSION/var/lib/pink2web/stores/ ; done
    cp dist/scripts/post-install.sh build/pink2web_$VERSION/DEBIAN/postinst
    cp dist/scripts/pre-uninstall.sh build/pink2web_$VERSION/DEBIAN/prerm
    chmod 0755 build/pink2web_$VERSION/DEBIAN/postinst
    chmod 0755 build/pink2web_$VERSION/DEBIAN/prerm

    ln -s /usr/local/lib/pink2web/bin/pink2web.service build/pink2web_$VERSION/etc/systemd/system/pink2web.service

    cd build
    dpkg-deb --build pink2web_$VERSION
  fi
fi
if [ "$1." == "x86_64." ] ; then
  export CC="/usr/bin/clang-11"
  # corral run -- ponyc -d -Dopenssl_3 --linker=clang-17
  corral run -- ponyc -d -Dopenssl_3.0.x

  if [ "$2." == "release." ] ; then
    export VERSION=`git tag | grep ^v | sort -r | head -1 | sed 's/v//' `
    echo "Building pinkweb_$VERSION"
    mkdir -p build/pink2web_$VERSION/
    cd build/pink2web_$VERSION/
    mkdir -p DEBIAN
    mkdir -p etc/systemd/system/
    mkdir -p etc/pink2web/
    mkdir -p usr/bin/
    mkdir -p usr/local/lib/pink2web/bin/
    mkdir -p var/lib/pink2web/processes/
    mkdir -p var/lib/pink2web/hist
    mkdir -p var/lib/pink2web/stores
    mkdir -p var/www/pink2web
    cd -
    echo "Source: pink2web
Section: other
Priority: optional
Maintainer: Niclas Hedhman <niclas@bali.io>
Uploaders:
Version: $VERSION
Standards-Version: 3.8.3
Package: pink2web
Homepage:
Architecture: amd64
Distribution:
Depends: python-serial
Description: pink2web is a block programming platform, intended for IoT and automation systems.
" >build/pink2web_$VERSION/DEBIAN/control

  echo "[Unit]
Description=Pink2Web block programming platform. Contact Bali Automation (https://bali.io) for more information.

[Service]
User=pink2web
Group=nogroup
EnvironmentFile=-/etc/default/pink2web
ExecStart=/usr/local/lib/pink2web/bin/pink2web --info run process --host=192.168.1.111 --startpage=pink2web.html --webdir=/var/www/pink2web /var/lib/pink2web/applications/main.json
Restart=on-failure

[Install]
WantedBy=multi-user.target" >build/pink2web_$VERSION/usr/local/lib/pink2web/bin/pink2web.service

    cp pink2web build/pink2web_$VERSION/usr/local/lib/pink2web/bin/pink2web
    cp -r frontend/dist/* build/pink2web_$VERSION/var/www/pink2web/
    cp -r dist/conf/* build/pink2web_$VERSION/etc/pink2web/
    for FILE in `ls dist/hist | grep -v dummy` ; do cp -r $FILE build/pink2web_$VERSION/var/lib/pink2web/hist/ ; done
    for FILE in `ls dist/stores | grep -v dummy` ; do cp -r $FILE build/pink2web_$VERSION/var/lib/pink2web/stores/ ; done
    cp dist/scripts/post-install.sh build/pink2web_$VERSION/DEBIAN/postinst
    cp dist/scripts/pre-uninstall.sh build/pink2web_$VERSION/DEBIAN/prerm
    chmod 0755 build/pink2web_$VERSION/DEBIAN/postinst
    chmod 0755 build/pink2web_$VERSION/DEBIAN/prerm

    ln -s /usr/local/lib/pink2web/bin/pink2web.service build/pink2web_$VERSION/etc/systemd/system/pink2web.service

    cd build
    dpkg-deb --build pink2web_$VERSION
  fi
fi


