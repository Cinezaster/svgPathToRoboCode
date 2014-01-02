/* 
  pin 3 is bluetooth indication
  pin 4 is paint led --> to attiny
  pin 5, 6, 7 is stepper1 (boom 1)
  pin 8 optical sensor boom 1
  pin 9, 10 , 11 is stepper2 (boom 2)
  apin 12 optical sensor boom 2
  pin A0 shutter trigger
  pin A1 flash trigger
*/

#include <AccelStepper.h>
AccelStepper stepper1(AccelStepper::DRIVER, 5, 6);
AccelStepper stepper2(AccelStepper::DRIVER, 9, 10);

int led = 4;
int optoI1 = 12;
int optoI2 = 8;
int shutter = A0;
int flash = A1;
int PlotterMaxSpeed =250;

int oldP, oldS;

void setup() {
  Serial1.begin(9600);
  pinMode(led, OUTPUT);
  pinMode(shutter, OUTPUT);
  pinMode(flash, OUTPUT);
  
  digitalWrite(led, LOW);
  
  digitalWrite(shutter, LOW);
  digitalWrite(flash, LOW);
  
  pinMode(optoI1, INPUT);
  pinMode(optoI2, INPUT);
  
  stepper1.setEnablePin(7);
  stepper2.setEnablePin(11);
  stepper1.disableOutputs();
  stepper2.disableOutputs();
}

void loop() {
  // put your main code here, to run repeatedly: 
  while (Serial1.available()) {
    // look for the next valid integer in the incoming serial stream:
    int p = Serial1.parseInt(); // primary boom position
    // do it again:
    int s = Serial1.parseInt(); // secondary boom postion
    // do it again:
    int l = Serial1.parseInt(); // light phase
    // do it again:
    int t = Serial1.parseInt(); // type of connection

    // look for the newline. That's the end of your sentence:
    if (Serial1.read() == '\n') {
        if (t == 2){
          End();
        } else if( t == 0){
          Home();
        } else if(t == 1) {
          if (p != oldP || s != oldS){ //test if is same as previous
            oldP = p;
            oldS = s;
            Serial1.println("p");
            Move(p, s);
            if(l == 1){
              digitalWrite(led, HIGH);
            } else {
              digitalWrite(led, LOW);
            }
        }
      }
    }
  }
}

void Move(int positionX,int positionY){

  stepper1.moveTo(positionX);
  stepper2.moveTo(positionY);

  //recalculate speed
  float dx=abs(stepper1.distanceToGo());
  float dy=abs(stepper2.distanceToGo());
  float coefX;
  float coefY;
  if (dx>dy){
    coefY=dx/dy;
  } 
  else coefY=1;

  if (dy>dx){
    coefX=dy/dx;
  } 
  else coefX=1;
  stepper1.setMaxSpeed(PlotterMaxSpeed/coefX);
  stepper2.setMaxSpeed(PlotterMaxSpeed/coefY);
  
  if (stepper1.distanceToGo() > 0) {
    stepper1.setSpeed(PlotterMaxSpeed/coefX);
  } else {
    stepper1.setSpeed(-PlotterMaxSpeed/coefX);
  }
  
  if (stepper2.distanceToGo() > 0) {
    stepper2.setSpeed(PlotterMaxSpeed/coefY);
  } else {
    stepper2.setSpeed(-PlotterMaxSpeed/coefY);
  }
  
  int x = 0;
  int y = 0;
  while (x < 1 && y < 1){
    if (stepper1.distanceToGo()==0) {
      x++;
    } else {
      stepper1.runSpeed();
    }
    if (stepper2.distanceToGo()==0) {
      y++;
    } else {
      stepper2.runSpeed();
    }
  } 
}

void Home(){
  stepper1.enableOutputs();
  stepper2.enableOutputs();
  stepper1.setSpeed(200);
  while(digitalRead(optoI1) == 1){ // beam blocked == 1
    stepper1.runSpeed();
  }
  stepper1.setCurrentPosition(0);
  stepper2.setSpeed(200);
  while(digitalRead(optoI2) == 1){ // beam blocked == 1
    stepper2.runSpeed();
  }
  stepper2.setCurrentPosition(0);
  Serial1.println("h");
  
  digitalWrite(shutter, HIGH);
  delay(200);
  digitalWrite(flash, HIGH);
  delay(50);
  digitalWrite(flash, LOW);
}

void End(){
  // end fase set enable pin on low
  digitalWrite(shutter, LOW);
  Serial1.println("e");
  stepper1.setCurrentPosition(0);
  stepper2.setCurrentPosition(0);
  stepper1.disableOutputs();
  stepper2.disableOutputs();
  digitalWrite(led, LOW);
}
