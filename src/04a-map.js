import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbersUsa()
let path = d3.geoPath().projection(projection)

//scales
let colorScale = d3.scaleSequential(d3.interpolatePiYG)
let transparencyScale = d3
  .scaleLinear()
  .domain([0, 50000])
  .range([0, 1])
  .clamp(true)

//read in data
d3.json(require('./data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(data) {
  //everytime use topojson, "objects" is what is important
  //console.log(json.objects)

//pull out usa, send it root of all data (data), give it the thing you're after you want to process (json.objects.us_counties)
  let counties = topojson.feature(data, data.objects.us_counties).features
  //console.log('the counties are', counties)

  // let datapoints = usa.properties
  // console.log(datapoints)

  svg
    .selectAll('.counties')
    .data(counties)
    .enter().append('path')
    //add a class
    .attr('class', 'counties')
    .attr('d', path)
    .attr('fill', d => {
      if (!d.properties.state) {
        // console.log(d.properties)
        return '#e6e6e6'
      } else {
        let percent =
          d.properties.trump / (d.properties.clinton + d.properties.trump)
        return colorScale(percent)
      }
    })
    .attr('opacity', d => {
      if (d.properties.state) {
        let totalVote = d.properties.clinton + d.properties.trump
        // console.log(totalVote)
        return transparencyScale(totalVote)
      }
      return 1
    })
}
