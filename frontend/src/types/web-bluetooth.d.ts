//file to allow bluetooth

interface Navigator {
  bluetooth: Bluetooth;
}

type SNSABluetoothDevice = Awaited<
    ReturnType<Bluetooth["requestDevice"]>
>;