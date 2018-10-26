import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 300 - margin.top - margin.bottom
let width = 330 - margin.left - margin.right

let container = d3.select('#chart-6')

let projection = d3.geoAlbersUsa()
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)

let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
var radiusScale = d3.scaleSqrt().range([0, 10])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([data, datapoints]) {
  console.log(data.objects)
  var usas = topojson.feature(data, data.objects.us_states)

  const power = datapoints.map(d => +d.Total_MW)
  radiusScale.domain(d3.extent(power))

  projection.fitSize([width, height], usas)

  var categories = datapoints.map(d => d.PrimSource)

  colorScale.domain(categories)

  var nested = d3
    .nest()
    .key(d => d.PrimSource)
    .entries(datapoints)

  //console.log('nested data is', nested)

  container
    .selectAll('.usa-graph')
    .data(nested)
    .enter()
    .append('svg')
    .attr('class', 'usa-graph')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
    .each(function(d) {
      let svg = d3.select(this)
      let datapoints = d.values
      // console.log('I am looping through', datapoints)

      //usa maps
      svg
        .selectAll('.usas')
        .data(usas.features)
        .enter()
        .append('path')
        .attr('class', 'usas')
        .attr('d', path)
        .attr('fill', '#e6e6e6')
        .lower()

      // powerplant circles
      svg
        .selectAll('.powerplants')
        .data(datapoints)
        .enter()
        .append('circle')
        .attr('class', 'powerplants')
        .attr('r', d => {
          // console.log(d)
          return radiusScale(d.Total_MW)
        })
        .attr('transform', d => {
          let coords = projection([d.Longitude, d.Latitude])
          return `translate(${coords})`
        })
        .attr('fill', d => colorScale(d.PrimSource))
        .attr('opacity', 0.6)

      //labels for each usa map
      svg
        .selectAll('.usa-label')
        .data(datapoints)
        .enter()
        .append('text')
        .attr('class', 'usa-label')
        .text(d => {
          // console.log(d)
          return d.PrimSource.charAt(0).toUpperCase() + d.PrimSource.slice(1)
        })
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 300)
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .attr('font-size', 13)
        .style('text-shadow','-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff')
    })
}