/* 
Your previous Plain Text content is preserved below:

/*
There is a factory production line around a single a conveyor belt.
Components (of type A and B) come onto the start of the belt at random intervals; workers must take one component of each type from the belt as they come past, and combine them to make a finished product (P).
The belt is divided into fixed-size slots; each slot can hold only one component or one finished product. There are a number of worker stations on either side of the belt, spaced to match the size of the slots on the belt, like this (fixed-width font ASCII pic):
       v   v   v   v   v          workers
     ---------------------
  -> | A |   | B | A | P | ->     conveyor belt
     ---------------------
       ^   ^   ^   ^   ^          workers
In each unit of time, the belt moves forwards one position, and there is time for a worker on one side of each slot to EITHER take an item from the slot or replace an item onto the belt. The worker opposite them can't touch the same belt slot while they do this.(So you can't have one worker picking something from a slot while their counterpart puts something down in the same place).
Once a worker has collected one of both types of component, they can begin assembling the finished product. This takes an amount of time, so they will only be ready to place the assembled product back on the belt on the fourth subsequent slot. While they are assembling the product, they can't touch the conveyor belt. Workers can only hold two items (component or product) at a time: one in each hand.
Create a simulation of this, with three pairs of workers. At each time interval, the slot at the start of the conveyor belt should have an equal (1/3) chance of containing nothing, a component A or a component B.
Run the simulation for 100 steps, and compute how many finished products come off the production line, and how many components of each type go through the production line without being picked up by any workers.


The code does not have to be 'production quality', but we will be looking for evidence that it's written to be somewhat flexible, and that a third party would be able to read and maintain it.
Be sure to state (or comment) your assumptions.
During the interview, we may ask about the effect of changing certain aspects of the simulation. (E.g. the length of the conveyor belt.)
Flexibility in the solution is preferred, but we are also looking for a sensible decision on where this adds too much complexity (where would it be better to rewrite the code for a different scenario, rather than spending much more than the allotted time creating an overly complicated, but very flexible simulation engine?)
*/


class Worker {
  constructor() {
    this.productionLength = 4;
    this.initState();
  }
  
  initState(){
    this.leftHand = '';
    this.rightHand = '';
    this.startedProductionStep = 0;
  }
  
  /*
  * @param step - current belt step to check if Worker is productiong or not
  */
  isBusy(step){
    return Boolean(this.startedProductionStep) && step - this.startedProductionStep < 4;
  }
  /*
  * @param step - current belt step to check if Worker has finished production
  */
  productIsReady(step){
    return Boolean(this.startedProductionStep) && step - this.startedProductionStep >= 4;
  }
  /*
  * @param component - Component to be handled 
  * @param step - current belt step to check Workers state
  */
  handleComponent(component, step) {
    if(this.productIsReady(step)){
      this.initState();
      if(component.isValidForProduction()) {
        this.leftHand = component.componentType;
      }
      component.setToFinished();
      //console.log('returned finished Product'); // for test cases
      return true;
    }
    if(!this.leftHand && component.isValidForProduction()){
      this.leftHand = component.componentType;
      component.setTaken();
      //console.log('took component to left hand'); // for test cases
      return true;
    } else if((this.leftHand === 'A' && component.componentType === 'B') ||
              (this.leftHand === 'B' && component.componentType === 'A')){
      component.setTaken();
      this.startedProductionStep = step;
      // console.log('took component to right hand and started production'); //for test cases
      return true;
    }
    return false;
  }
}

class Component {
  /*
  * @param step - current belt step for custom input test cases in the next function
  */
  constructor(step) {
    const componentTypes = ['A','B','','P'];
    this.componentType = componentTypes[this.generateIndex()];
    //this.componentType = this.generateFormCustomTestCase(step);
  }
  
  generateFormCustomTestCase(step){
    const testCase = ['','','','','','','','','',''];
    return testCase[step];
  }
  
  generateIndex() {
    return Math.floor(Math.random() * 3);  
  }
  
  setTaken(){
    this.componentType = '';
  }
  
  setToFinished(){
    this.componentType = 'P';
  }
  
  isValidForProduction(){
    return ['A','B'].includes(this.componentType);
  }
}

class Convoyer {
  /*
  * @param beltLength - length of the convoyers belt
  * @param steps - steps amount in the program
  * @param componentTypes - array of slots states on the belt
  */
  constructor(beltLength = 0, steps = 0, componentTypes = []) {
    this.belt = []; // queque for belt simulation
    this.beltLength = beltLength;
    this.steps = steps;
    // workers array contains array of 2 workers with same index as slot on the belt
    this.workers = [];
    this.initWorkers();
    // map for count removed component from belt
    this.result = {}; 
    this.initResult(componentTypes);
    this.run();
  }
  /*
  * @param componentTypes - array of slots states on the belt
  */
  initResult(componentTypes) {
    const that = this;
    componentTypes.forEach(function(element){
      that.result[element] = 0;
    });
  }
  
  initWorkers() {
    for(let i = 0; i < this.beltLength; i++){
      this.workers.push([new Worker(), new Worker()]); 
    }
  }
  /*
  * @param step - current belt step for custom input test cases
  */
  addComponent(step) {
    if(this.belt.length === this.beltLength){
      this.removeAndCountComponent();  
    }
    this.belt.unshift(new Component(step));
  }
  
  removeAndCountComponent() {
    let removedComponent = this.belt.pop();
    this.result[removedComponent.componentType] += 1;
  }
  
  printBelt() {
    let printArray = [];
    this.belt.forEach(function(element){
      printArray.push(element.componentType);
    });
    console.log(printArray);
  }
  
  // number of workers could be set as param, but it is unnecessary complexity
  /*
  * @param step - current belt step to check Workers state
  */
  notifyWorkers(step) {
    const workers = this.workers;
    this.belt.forEach(function(component, index){
      let didSmth = false;
      if(!workers[index][0].isBusy(step)){
        //console.log(`left worker on ${index} position`); // for test cases
        didSmth = workers[index][0].handleComponent(component, step); 
        /*
        if(!didSmth){
          console.log('did nothing');
        }
        */ 
      } 
      if(!didSmth && !workers[index][1].isBusy(step)){
        //console.log(`right worker on ${index} position`); // for test cases
        didSmth = workers[index][1].handleComponent(component, step);
        /*
        if(!didSmth){
          console.log('did nothing');
        }
        */
      }     
    });
  }
  
  run() {
    for(let step = 0; step < this.steps; step++){
      this.addComponent(step);
      //console.log(step); fro test cases
      //this.printBelt();
      this.notifyWorkers(step);
      //this.printBelt();
    }
  }
}

const componentTypes = ['A','B','','P'];
let convoyer = new Convoyer(3, 100, componentTypes);
delete convoyer.result[''];
console.log(convoyer.result);