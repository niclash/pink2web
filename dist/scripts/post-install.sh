#!/bin/bash
#
USER=pink2web
GROUP=nogroup
adduser --system --quiet $USER
usermod -a -G dialout $USER
usermod -a -G i2c $USER
usermod -a -G gpio $USER
LOG_DIR=/var/log/pink2web
if [ ! -d  $LOG_DIR ] ; then
    mkdir -p $LOG_DIR
fi
chown $USER:$GROUP $LOG_DIR
chown -R $USER:$GROUP /var/lib/pink2web
chown -R $USER:$GROUP /etc/pink2web
systemctl mask serial-getty@ttyS0.service

systemctl enable pink2web
service pink2web start
