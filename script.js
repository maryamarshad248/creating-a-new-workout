'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout {

  date = new Date();
  id = (Date.now()+ ''). slice(-10);
  constructor(coords,duration, distance) {
    this.coords = coords;
    this.duration = duration; // in min
    this.distance = distance; // in km
  }
}

class running extends Workout{
  type = 'running'
  constructor(coords,duration, distance,cadence) {
 super(coords, duration, distance)
 this.cadence= cadence;
 this.calcPace();
  }

  calcPace() {
    this.pace = this.duration/ this.distance
    return this.pace;
  }
}

class cycling extends Workout{
  type = 'cycling'
  constructor (coords,duration,distance, elevationGain) {
    super(coords, duration, distance)
 this.elevationGain = elevationGain;
  this.calcSpeed()
  }

  calcSpeed() {
    this.speed = this.distance/ this.duration
    return this.speed;
  }
}

const run1 =  new running([39, -12], 5.2, 24 , 178)
const cycle1 = new cycling([39, -12], 23, 67, 523)
console.log(run1, cycle1);
//////////////////////////////////////////////////////////////////////
//// application architecture
class App{
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition()
    form.addEventListener('submit', this._newWorkout.bind(this))
   inputType.addEventListener('change', this._toggleElevationField)  
     }

  _getPosition() {
    if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
      alert('could not get your position');
    }
  );
  }

  _loadMap(position) {
    
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      const coords = [latitude, longitude];
      console.log(this);
      this.#map = L.map('map').setView(coords, 13);
      //console.log(map);

      L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.#map);
      //handling clicks on map
      this.#map.on('click', this._showForm.bind(this))
       }
  _showForm(mapE) {
  this.#mapEvent = mapE;
  form.classList.remove('hidden');
  inputDistance.focus();
}

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {

    const validInputs = (...inputs)=> 
    inputs.every(inp=> Number.isFinite(inp))
    const allPositive = (...inputs) =>
    inputs.every(inp=>inp>0);

    e.preventDefault();

    // get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // if workout running , create running object

    if(type=== 'running') {
      const cadence = +inputCadence.value;

      // check if data is valid

       if(
      // // !Number.isFinite(distance) || 
      // // !Number.isFinite(duration)|| 
      // // !Number.isFinite(cadence)
      !validInputs(distance, duration,cadence) || 
      !allPositive(distance, duration,cadence)) 
      return alert('inputs have to be some positive numbers') 
     workout = new running([lat, lng], distance, duration, cadence)
      
    }

    // if workout cycling create cycling object
    if(type=== 'cycling') {
      const elevation = +inputElevation.value;
      if(
      !validInputs(distance, duration,elevation)||
      !allPositive(distance, duration))  
      return alert('inputs have to be some positive numbers') 
      workout = new cycling([lat, lng], distance, duration, elevation)
      }
   // add new object to workout array
    this.#workouts.push(workout)
     console.log(workout);
    // render workout on map as marker
    this.renderWorkoutMarker(workout)
      
       
        // render workout on list
        // hide form + clear input fields
  inputDistance.value =inputDuration.value =inputElevation.value =inputCadence.value = 
       ''
  }

  renderWorkoutMarker(workout) {
  L.marker(workout.coords)
  .addTo(this.#map)
   .bindPopup(
   L.popup({
  maxWidth: 250,
  minWidth: 100,
  autoClose: false,
  closeOnClick: false,
 className: `${workout.type}-popup`,
  })
  )
  .setPopupContent('workout')
 .openPopup();
   }  
  }   
 const app = new App()
 
  
