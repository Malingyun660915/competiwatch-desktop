import React, { Component } from 'react'
import { defaults } from 'react-chartjs-2'
import LoadingPage from './LoadingPage'
import WinLossChart from './WinLossChart'
import ThrowerLeaverChart from './ThrowerLeaverChart'
import StreaksChart from './StreaksChart'
import GroupSizeChart from './GroupSizeChart'
import HeroesChart from './HeroesChart'
import DayTimeChart from './DayTimeChart'
import RoleChart from './RoleChart'
import MapChart from './MapChart'
import Match from '../models/Match'
import Account from '../models/Account'
import Color from '../models/Color'
import './TrendsPage.css'

class TrendsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  refreshAccount = () => {
    const { accountID } = this.props

    Account.find(accountID).then(account => {
      this.setState(prevState => ({ account }))
    })
  }

  refreshMatches = () => {
    const { accountID, season } = this.props

    Match.findAll(accountID, season).then(matches => {
      this.setState(prevState => ({ matches }))
    })
  }

  chartFontColor = () => {
    if (this.props.theme === 'dark') {
      return Color.darkThemeText
    }

    return Color.lightThemeText
  }

  componentDidMount() {
    this.refreshMatches()
    this.refreshAccount()
    defaults.global.defaultFontColor = this.chartFontColor()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.season !== this.props.season ||
        prevProps.accountID !== this.props.accountID) {
      this.refreshMatches()
    }
    if (prevProps.accountID !== this.props.accountID) {
      this.refreshAccount()
    }
  }

  anyMatchesWithHeroes = () => {
    return this.state.matches.filter(match => match.heroList.length > 0).length > 0
  }

  showDayTimeChart = () => {
    return this.state.matches.filter(match => match.dayOfWeek && match.timeOfDay).length > 0
  }

  showMapChart = () => {
    return this.state.matches.filter(match => match.map).length > 0
  }

  render() {
    const { matches, account } = this.state
    if (!matches || !account) {
      return <LoadingPage />
    }

    const { season, theme } = this.props

    if (matches.length < 1) {
      return (
        <div className="container mb-4 layout-children-container">
          <div className="blankslate">
            <h3 className="mb-2 h3">No match history</h3>
            <p>No matches have been logged in season {season} for {account.battletag}.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="container mb-4 layout-children-container">
        <div className="clearfix">
          <div className="col-md-5 float-md-left">
            <WinLossChart season={season} matches={matches} />
          </div>
          <div className="col-md-5 offset-md-2 float-md-left">
            <ThrowerLeaverChart season={season} matches={matches} />
          </div>
        </div>
        <hr className="mb-4 pt-4" />
        <StreaksChart season={season} matches={matches} />
        {this.showMapChart() ? (
          <div>
            <hr className="mb-4 pt-4" />
            <MapChart season={season} matches={matches} />
          </div>
        ) : null}
        <hr className="mb-4 pt-4" />
        <GroupSizeChart season={season} matches={matches} />
        {this.anyMatchesWithHeroes() ? (
          <div>
            <hr className="mb-4 pt-4" />
            <HeroesChart season={season} matches={matches} />
            <hr className="mb-4 pt-4" />
            <div className="col-md-7 mx-auto">
              <RoleChart season={season} theme={theme} matches={matches} />
            </div>
          </div>
        ) : null}
        {this.showDayTimeChart() ? (
          <div>
            <hr className="mb-4 pt-4" />
            <DayTimeChart season={season} matches={matches} />
          </div>
        ) : null}
      </div>
    )
  }
}

export default TrendsPage
