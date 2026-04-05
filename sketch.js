// Final Project
// Geography 581, Fall 2025
// By Sam Jackowski
// This is a map of crime data for the 50 US states from the latter half of the 20th century and into the 21st
// The map allows you to see individual rates for each state (hover) and also allows for year and crime selection
// Line plot on the bottom shows the overall trend per crime for each state.
// Sources: Canvas Example code, https://leafletjs.com/examples/choropleth/


//setup map and table
let crimeTable;
let geojson;
let mapWidth;
let alaskaMap;
let hawaiiMap;
let alaskaLayer;
let hawaiiLayer;

// legend
let quintileBreaks = [];
let legend; 
const fixed_scale = {
  "Index Offense Rate": [0, 500, 1000, 2000, 3000],
  "Violent Crime Rate": [0, 100, 200, 400, 600],
  "Property Crime Rate": [0, 750, 1400, 2100, 4000],
  "Murder and Nonnegligent Manslaughter Rate": [0, 2, 5, 10, 19],
  "Rape Rate": [0, 15, 30, 45, 60],
  "Robbery Rate": [0, 50, 100, 200, 400],
  "Aggravated Assault Rate": [0, 50, 100, 200, 400],
  "Burglary Rate": [0, 200, 400, 600, 700],
  "Larceny-Theft Rate": [0, 500, 1000, 2000, 3000],
  "Motor Vehicle Theft Rate": [0, 100, 150, 200, 400]
};

// interactive variables
let YEAR_TO_USE = 1960;
let CRIME_COLUMN = "Violent Crime Rate";   
let CURRENT_STATE_FOR_CHART = null;

// setup slider and dropdwon
let yearSlider;
let crimeSelect;


var info = L.control();

// load in the crime data
function preload() {
 crimeTable = loadTable('crimebystate.tsv', 'tsv', 'header');

}


function setup() {

// Build map in Leaflet, set view to US, zoom, dark basemap
const mapContainer = document.getElementById('mapid');
mapContainer.style.height = "600px";  // shorter height
mapWidth = mapContainer.offsetWidth;

// declare map
let map = L.map('mapid').setView([37.8, -96], 4);
  
  
// mini maps for Alaska and Hawaii
  
//disable interactivity on the insets
noInteraction = {
  attributionControl: false,
  zoomControl: false,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  tap: false
}
  
// create the inset layers
alaskaMap = L.map('alaska-inset', noInteraction).setView([64.0, -150], 2);
hawaiiMap = L.map('hawaii-inset', noInteraction).setView([20.8, -157.5], 5);
dcMap = L.map('dc-inset', noInteraction).setView([38.9, -77], 9);

  
// add a basemap to the insets
L.tileLayer('https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
  .addTo(alaskaMap);
L.geoJson(statesData, { style }).addTo(alaskaMap);
  
L.tileLayer('https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
  .addTo(hawaiiMap);
L.geoJson(statesData, { style }).addTo(hawaiiMap);


L.tileLayer('https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
  .addTo(dcMap);
L.geoJson(statesData, { style }).addTo(dcMap);
  

// add visual data to the insets   
alaskaLayer = L.geoJson(statesData, { style: style, onEachFeature }).addTo(alaskaMap);
hawaiiLayer = L.geoJson(statesData, { style: style, onEachFeature }).addTo(hawaiiMap);
let dcFeatures = statesData.features.filter(f => f.properties.name == "District of Columbia"); //remove other states
dcLayer = L.geoJson(dcFeatures, { style: style, onEachFeature }).addTo(dcMap);


//create basemap
let base = L.tileLayer(
  'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
).addTo(map);
  
map.invalidateSize();
  
// Info box to show current crime, year, and instructions
info.update = function (props) {
  this._div.innerHTML = `
    <h4>${CRIME_COLUMN} (${YEAR_TO_USE})</h4>
    ${props ? `<b>${props.name}</b><br>${props.crime ?? "No data"} per 100k` : "Hover over a state"}
  `;
};
  
// add info box to the map
info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};
  

  
  info.addTo(map);	


//Set up year slider style, position
//link value for year data to this slider
yearSlider = createSlider(1960,2021, 1960,1 )
yearSlider.position(20,500)
yearSlider.style('width', '375px');
yearSlider.style('accent-color', 'rgb(0,210,255)')
  
// detects input to slider, updates map
yearSlider.input(() => {
    YEAR_TO_USE = yearSlider.value();
    yearText.html(` ${YEAR_TO_USE}`);
    updateMapData();
  });
   
// Creates a drop down using an array of crime types, style is set in style.css
crimeSelect = createSelect();
crimeSelect.position(20,540);
crimeSelect.addClass('crimeSelect');

//array of crimes
let crimeTypes = [
    "Index Offense Rate",
    "Violent Crime Rate",
    "Property Crime Rate",
    "Murder and Nonnegligent Manslaughter Rate",
    "Rape Rate",
    "Robbery Rate",
    "Aggravated Assault Rate",
    "Burglary Rate",
    "Larceny-Theft Rate",
    "Motor Vehicle Theft Rate"
  ];
  
// When a crime type is selected the data being shown is updated for map and line graph
crimeTypes.forEach(type => crimeSelect.option(type));
crimeSelect.selected(CRIME_COLUMN); // Sets to default value
crimeSelect.changed(() => { // When a new value is pressed, update
  CRIME_COLUMN = crimeSelect.value();
  updateMapData();
});
  
attachCrimeData(); // Prepares data for display
geojson = L.geoJson(statesData, { style: style, onEachFeature }).addTo(map); // adds layer to map
  
mapWidth = document.getElementById('mapid').offsetWidth; // allows for dynamic map width scaling
  
chart = createCanvas(mapWidth, 440); // create canvas below map when hovered
chart.parent("chartContainer"); 

//makes sure slider stays on top
yearSlider.style('z-index', '1000');  
crimeSelect.style('z-index', '1000');


// Create text next  to the slide rbar to show current year
let yearText = createP(` ${YEAR_TO_USE}`);
yearText.position(400, 470);
yearText.style('z-index', '1000');
yearText.style('color', 'rgb(255,0,0)')
yearText.style('font-size', '25px')
  
  
// Add a legend to the map 
  
legend = L.control({position: 'bottomright'});
  
legend.onAdd = function(map){ //defines what the legend looks like
  this._div = L.DomUtil.create('div', 'info legend'); // creates element to hold legend info
  this.update(); // creates the initial legend values
  return this._div; //returns legend to be added to map
}
  
legend.update = function(){
  
  if (!this._div) return; //safety
  this._div.innerHTML = "<strong>Crime Rate (per 100k)</strong><br><br>"; //set legend title
  if (quintileBreaks.length < 4) return; //safety if quintiles are not ready
  const grades = quintileBreaks; //creates an array of legend values
  
for (let i = grades.length - 1; i >= 0; i--) {
  let from = grades[i];
  let to = grades[i + 1];

  this._div.innerHTML +=
    `<i style="background:${getColor(from + 0.0001)};"></i>
     ${from.toFixed(1)}${to ? '&ndash;' + to.toFixed(1) : '+'}<br>`;
}
  

}
  

  
 //adds legend to map
legend.addTo(map)
  
//call update before anything to ensure legend is filled from the getgo
updateMapData(); 

}
  
// Helper function that traverses the crime data for the selected year and crime type in order to gather data for display
function attachCrimeData(){
  
  //clear old data
   statesData.features.forEach(f => { 
     if(f.properties) f.properties.crime = null; 
   });
  
  //loops rows to find the proper year for all states
   for(let r = 0; r<crimeTable.getRowCount(); r++){
    let year = crimeTable.getNum(r, "Year");
    if (year !== YEAR_TO_USE) continue;

    // gets state name and value for it
    let stateName = crimeTable.getString(r, "State");
    let crimeRate = crimeTable.getNum(r, CRIME_COLUMN);
     
     // attaches that rate to that state display
    statesData.features.forEach(f => {
      if(f.properties.name == stateName){
          f.properties.crime = crimeRate;
      }
    });
   }
}
// calls in the attachCrimeData to update its data and then refreshes the map and info box with the new data
function updateMapData(){
  attachCrimeData();
  
  // original code base on this tutorial: https://leafletjs.com/examples/choropleth/
  let allValues = [];
  statesData.features.forEach(f => {
    allValues.push(f.properties.crime);
  });
  
  //sort values
  allValues.sort((a,b) => a-b)
  
  // create and store quintile scale
  quintileBreaks = fixed_scale[CRIME_COLUMN];
  // update info box and legend 
  geojson.eachLayer(layer => { geojson.resetStyle(layer);});
  alaskaLayer.eachLayer(layer => layer.setStyle(style(layer.feature)));
  hawaiiLayer.eachLayer(layer => layer.setStyle(style(layer.feature)));
  dcLayer.eachLayer(layer => layer.setStyle(style(layer.feature)));
  info.update();
  legend.update();
  
}
  
// style, getColor, highlightFeature, resetHighlight, and onEachFeature were all sourced from 
//Professor Skupins example shown in class, stylistic edits made by me
//Source: https://editor.p5js.org/skupin@sdsu.edu/sketches/mlMloQIjf
function style(feature) {
    return {
        fillColor: getColor(feature.properties.crime),
        weight: 2,
        opacity: 1,
        color: 'rgb(0,0,50)',
        fillOpacity: 0.7
    };
}

// quintile based color scheme to change dynamically 
function getColor(d) {
  if (quintileBreaks.length < 5) return '#ccc'; // safety

  return d > quintileBreaks[4] ? '#08306B' : 
         d > quintileBreaks[3] ? '#08519C' :  
         d > quintileBreaks[2] ? '#2171B5' :  
         d > quintileBreaks[1] ? '#6BAED6' : 
                                 '#9ECAE1';  
}

  

function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 3,
			color: 'rgb(210,0,0)',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);

        CURRENT_STATE_FOR_CHART = layer.feature.properties.name;
        updateLineChart();
	}

function resetHighlight(e) {
        const layer = e.target;
        if (geojson.hasLayer(layer)) geojson.resetStyle(layer);
        if (alaskaLayer.hasLayer(layer)) alaskaLayer.resetStyle(layer);
        if (hawaiiLayer.hasLayer(layer)) hawaiiLayer.resetStyle(layer);
        if (dcLayer.hasLayer(layer)) dcLayer.resetStyle(layer);
		info.update();
  
        CURRENT_STATE_FOR_CHART = null;
        updateLineChart();
	}



function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
		});
	}

// Main function that draws the overall line chart 
function updateLineChart(){
  
  //removes old chart, sets background to 0
  clear();
  background(0);
  
  //safety net to make sure state is named and only draw when hovering
  if(!CURRENT_STATE_FOR_CHART) return;
    
  //declare variables to be used later in the function
  let years = [];
  let values = [];
  let xStart = 120;
  let xEnd = mapWidth-20;
  let yAxis = 350;
  
  //loop through the table and make two arrays to get year data and rate data for each year for that state
  for(let r = 0; r< crimeTable.getRowCount(); r++){
    let stateName = crimeTable.getString(r, "State")
    if(stateName != CURRENT_STATE_FOR_CHART) continue; 
    
    years.push(crimeTable.getNum(r, "Year"));
    values.push(crimeTable.getNum(r, CRIME_COLUMN));
    
  }
  
  // safety net for empty states
  if(values.length === 0) return; 
  
  // Draw the x and y acis
  push();
  stroke(0,210,255);
  strokeWeight(3);
  line(xStart,350, mapWidth-20, 350)
  line(xStart,350, xStart,50)
  
  // Find the min and max Y values
  let minV = Math.min(...values);
  let maxV = Math.max(...values);
  
  // Draw the chart title 
  fill(0,210,255);
  strokeWeight(1);
  textSize(30);
  text(`${CURRENT_STATE_FOR_CHART} ${CRIME_COLUMN}`, mapWidth/2.7, 30);
  
  // Draw the line plot itself
  stroke(255,0,0);
  strokeWeight(5);
  noFill();
  beginShape();
  for(let i =0; i < years.length; i ++){
    let x = map(years[i], 1960,2021, xStart, mapWidth-25)
    let y = map(values[i], minV, maxV, 350,50)
    vertex(x,y);
  }
  endShape();
  pop();
  

  // Set the X axis scale with values
  let yearsToLabel = [1960,1980,2000,2020];
  textSize(16);
  fill(255,0,0);
  noStroke();
  yearsToLabel.forEach(yr =>{
    let x = map(yr, 1960,2021, xStart-20, xEnd-20);
    text(yr,x, yAxis+30)
  });
  
  // Set the Y axis scale with values
  let yLabels = 4;
  for(let i =0; i<= yLabels; i++){
    let yVal = minV + i*(maxV-minV)/yLabels;
    let y = map(yVal, minV,maxV, 350,50);
    text(nf(yVal,0,1), xStart-47,y)
  }
  
  //Label the x and y axis 
  
  stroke(0,210,255)
  fill(0,210,255)
  text("YEAR", mapWidth/2, 420)
  
  let start = 150
  text("R", 40, start)
  text("A", 40, start+25)
  text("T", 40, start+50)
  text("E", 40, start+75)
}
  
  
  
  