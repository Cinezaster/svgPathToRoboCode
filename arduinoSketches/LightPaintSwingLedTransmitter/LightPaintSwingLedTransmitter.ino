#include <VirtualWire.h>
int input = 0;

void setup() {                
  pinMode(input, INPUT);     
  vw_set_tx_pin(4); // Setup transmit pin
  vw_setup(2000); // Transmission speed in bits per second.
}

void loop() {
    if (digitalRead(input) == HIGH) {
      // send on
      const char *msg = "1";
      vw_send((uint8_t *)msg, strlen(msg));
      vw_wait_tx(); // Wait until the whole message is gone
    } else {
      // send 0
      const char *msg = "0";
      vw_send((uint8_t *)msg, strlen(msg));
      vw_wait_tx();
    }
}
