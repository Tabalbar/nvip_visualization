function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const int = randomIntFromInterval(1, 3);
console.log(int);
//1 is Pho
//2 is Boiling Crab
//3 is Gym
