import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 800 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoEqualEarth().rotate([-10, 0])
//lat long lines on an earth
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)
let nyc = [-74, 40]

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/flights.csv')),
  d3.csv(require('./data/airport-codes-subset.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

let coordinateStore = d3.map()

function ready([json, datapointsFlight, datapoints]) {
  // console.log(json.objects)
  let countries = topojson.feature(json, json.objects.countries)
  console.log(datapoints)

  projection.fitSize([width, height], countries)

  datapoints.forEach(d => {
    // console.log(coordinateStore)
    let name = d.ident
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    //countries
    .attr('fill', '#e0e0e0')
    //countries outline
    .attr('stroke', 'white')
    .attr('stroke-width', 0.4)
  
  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    //all oceans
    .attr('fill', 'white')
    .attr('stroke-width', 1)
    .lower()

//globe outline
  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', 'rgb(255, 255, 255, .00000001)')
    .attr('stroke', '#e0e0e0')
    .attr('stroke-width', 1)
  
  // add airports circles
  svg
    .selectAll('.airport-points')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'airports')
    .attr('r', 2)
    .style('fill', '#714ad7')
    .attr('transform', d => {
      let coords = projection([d.longitude, d.latitude])
      return `translate(${coords})`
    })

  // add transit line
  svg
    .selectAll('.transit')
    .data(datapoints)
    .enter()
    .append('path')
    .attr('d', d => {
      console.log(coordinateStore.get(d.ident))
      // Get coordinates
      let fromCoords = nyc
      let toCoords = coordinateStore.get(d.ident)

      // Build a GeoJSON LineString
      var geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      //Send to our d3.geoPath()
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', '#714ad7')
    .attr('stroke-width', 1)
    .attr('opacity', 0.5)
    .attr('stroke-linecap', 'round')

//add a title
  svg
    .append('text')
    .text('Non-stop international flights from JFK')
    .attr('fill', 'white')
    .attr('x', width/2)
    .attr('y', 30)
    .attr('font-size', 22)
    .attr('font-weight', 500)
    .attr('text-anchor', 'middle')


   svg
    .append('rect')
    .attr('width', 400)
    .attr('height', 35)
    .attr('x', 180)
    .attr('y', 5)
    .attr('fill', '#aaaaaa')
    .lower()

// .on('mouseover', function(d) {
//       // Make the circle black
//       d3.select(this)
//         .transition()
//         .duration(200)
//       d3.select(this).text(d.airport)
//       d3.select(this).text(d.airlines)
//       d3.select(this).style('display', 'block')

//     })
//     .on('mouseout', function(d) {
//       // Change the color to the correct color
//       d3.select(this)
//         .transition()
//         .duration(200)
//       d3.select('#info').style('display', 'none')
//     })

}
