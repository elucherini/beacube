# README #

# Prerequisites #

### OS X ###
* install Xcode

### Linux ###
* Kernel version 3.6 or above
* libbluetooth-dev
* libavahi-compat-libdnssd-dev

### Ubuntu/Debian/Raspbian ###
>sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev

### Fedora / Other-RPM based ###
>sudo yum install bluez bluez-libs bluez-libs-devel

### Windows ###
* node-gyp requirements for Windows
    * Python 2.7
    * Visual Studio (Express)
* node-bluetooth-hci-socket prerequisites
    * Compatible Bluetooth 4.0 USB adapter
    * WinUSB driver setup for Bluetooth 4.0 USB adapter, using Zadig tool


# Setup #
Run "npm install" in order to install all dependencies

# Usage #
>sudo node beacube

# Running on Linux #

### Running without root/sudo ###
Run the following command:
>sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

This grants the node binary cap_net_raw privileges, so it can start/stop BLE advertising.
Note: The above command requires setcap to be installed, it can be installed using the following:
=> apt: >sudo apt-get install libcap2-bin
=> yum: >su -c \'yum install libcap2-bin\'

Note: some warnings appear on linux but it should works fine

### Multiple Adapters ###
hci0 is used by default to override set the NOBLE_HCI_DEVICE_ID environment variable to the interface number.
Example, specify hci1:
>sudo NOBLE_HCI_DEVICE_ID=1 node beacube.js