#include <AccelStepper.h>
AccelStepper stepper1(AccelStepper::DRIVER, 8, 9);
AccelStepper stepper2(AccelStepper::DRIVER, 10, 11);

int led = 13;
int PlotterMaxSpeedX =120;
int PlotterMaxSpeedY =120;
int enablepin;
int oldP, oldS;

void setup() {
  Serial1.begin(9600);
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);
  pinMode(enablepin, OUTPUT);
  digitalWrite(enablepin, LOW);
  Serial1.println("Start");
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
      
      if (p != oldP && s != oldS){ //test if is same as previous
        oldP = p;
        oldS = s;
        if (t == 2){
          // end fase set enable pin on low
          Serial1.print("p");
        } else if( t == 0){
          Home();
        } else if(t == 1) {
          Serial1.print("p");
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
  //if X longer distance than minimize max speed for Y
  stepper1.setMaxSpeed(PlotterMaxSpeedX/coefX);
  //stepper1.setAcceleration(PlotterMaxSpeedX/coefX);
  stepper2.setMaxSpeed(PlotterMaxSpeedY/coefY);
  //stepper2.setAcceleration(PlotterMaxSpeedY/coefY);
  
  if (stepper1.distanceToGo() > 0) {
    //Serial.println(PlotterMaxSpeedX/coefX);
    stepper1.setSpeed(PlotterMaxSpeedX/coefX);
  } else {
    //Serial.println(-PlotterMaxSpeedX/coefX);
    stepper1.setSpeed(-PlotterMaxSpeedX/coefX);
  }
  
  if (stepper2.distanceToGo() > 0) {
    //Serial.println(PlotterMaxSpeedY/coefY);
    stepper2.setSpeed(PlotterMaxSpeedY/coefY);
  } else {
    //Serial.println(-PlotterMaxSpeedY/coefY);
    stepper2.setSpeed(-PlotterMaxSpeedY/coefY);
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
  Serial1.print("h");
}
  
