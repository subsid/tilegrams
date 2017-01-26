import {csvParseRows} from 'd3-dsv'
import geographyResource from './GeographyResource.js'
import populationCsv from '../../data/population-by-state.csv'
import electoralCollegeCsv from '../../data/electoral-college-votes-by-state.csv'
import gdpCsv from '../../data/gdp-by-state.csv'
import populationWorld from '../../data/world-population.csv'
import ukConstituency from '../../data/uk-constituencies.csv'

class DatasetResource {
  constructor() {
    this._datasets = [
      {
        label: 'U.S. Population 2016',
        data: this.parseCsv(populationCsv, 'United States'),
        geography: 'United States',
      },
      {
        label: 'U.S. Electoral College 2016',
        data: this.parseCsv(electoralCollegeCsv, 'United States'),
        geography: 'United States',
      },
      {
        label: 'U.S. GDP 2015 (Millions)',
        data: this.parseCsv(gdpCsv, 'United States'),
        geography: 'United States',
      },
      {
        label: 'U.K. Constituency Map',
        data: this.parseCsv(ukConstituency, 'United Kingdom'),
        geography: 'United Kingdom',
      },
      {
        label: 'World Population',
        data: this.parseCsv(populationWorld, 'World'),
        geography: 'World',
      },
    ]
    this._selectedDatasetIndex = 2
  }

  _validateFips(fips) {
    return fips && fips.length < 2 ? `0${fips}` : fips
  }

  parseCsv(csv, geography, customUpload) {
    const mapResource = geographyResource.getMapResource(geography)
    const features = mapResource.getUniqueFeatureIds()
    const badMapIds = []
    const badValueIds = []
    let parsed
    if (geography === 'United States') {
      parsed = csvParseRows(csv, d => [this._validateFips(d[0]), parseFloat(d[1])])
    } else {
      parsed = csvParseRows(csv, d => [d[0], parseFloat(d[1])])
    }
    if (customUpload) {
      // extra data validation for custom uploads
      parsed = parsed.filter(row => {
        const hasId = (features.indexOf(row[0]) > -1)
        if (!hasId) {
          badMapIds.push(row[0])
        }
        if (row[1] <= 0 || isNaN(row[1])) {
          badValueIds.push(row[0])
        }
        return hasId && row[1] > 0
      })
      if (badMapIds.length || badValueIds.length) {
        this._warnDataErrors(badMapIds, badValueIds)
      }
    }
    return parsed
  }

  _warnDataErrors(badMapIds, badValueIds) {
    const mapIdString = badMapIds.map(id => `"${id}"`).join(', ')
    const valueIdString = badValueIds.map(id => `"${id}"`).join(', ')
    let alertString = ''
    if (mapIdString) {
      alertString += `There is no associated map data associated with id(s): ${mapIdString}.`
    }
    if (valueIdString) {
      alertString += ` Ids ${valueIdString} have zero or negative value.`
    }
    alertString += ' This data has been pruned.'
    // eslint-disable-next-line no-alert
    alert(alertString)
  }

  getLabels() {
    return this._datasets.map(dataset => dataset.label)
  }

  getDataset(index) {
    return this._datasets[index].data
  }

  getDatasetsByGeography(geography) {
    console.log(geography)
    return this._datasets.filter(dataset => dataset.geography === geography)
  }

  buildDatasetFromTiles(tiles) {
    const datasetMap = {}
    tiles.forEach((tile) => {
      datasetMap[tile.id] = [tile.id, tile.tilegramValue]
    })
    return Object.keys(datasetMap).map((row) => datasetMap[row])
  }
}

export default new DatasetResource()