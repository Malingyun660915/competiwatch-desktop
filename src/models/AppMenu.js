import os from 'os'
import PackageInfo from '../../package.json'

const remote = window.require('electron').remote
const shell = window.require('electron').shell
const { Menu, app } = remote

class AppMenu {
  constructor(options) {
    this.onPageChange = options.onPageChange
    this.onSeasonChange = options.onSeasonChange
    this.onAccountChange = options.onAccountChange
    this.latestSeason = options.latestSeason
    this.accounts = options.accounts
    this.showMatchesMenuItem = options.season && options.accountID
    this.showLogMatchMenuItem = this.showMatchesMenuItem
    this.isMac = os.release().indexOf('Macintosh') > -1
    this.altOrOption = this.isMac ? 'Option' : 'Alt'

    const template = this.getMenuTemplate()
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  getMenuTemplate() {
    if (this.isMac) {
      return this.getMacMenuTemplate()
    }

    return this.getNonMacMenuTemplate()
  }

  getMacMenuTemplate() {
    const menuItems = [
      {
        label: app.getName(),
        submenu: [
          this.aboutMenuItem(),
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click() { app.quit() }
          }
        ]
      },
      {
        label: 'View',
        submenu: this.viewSubmenu()
      }
    ]
    if (this.accounts.length > 0) {
      menuItems.push({
        label: 'Account',
        submenu: this.accountSubmenu()
      })
    }
    menuItems.push({
      label: 'Season',
      submenu: this.seasonSubmenu()
    })
    menuItems.push({
      label: 'Tools',
      submenu: [
        this.developerToolsMenuItem()
      ]
    })
    menuItems.push({
      label: 'Help',
      submenu: [
        this.bugReportMenuItem()
      ]
    })
    return menuItems
  }

  getNonMacMenuTemplate() {
    const menuItems = [
      {
        label: 'View',
        submenu: this.viewSubmenu()
      }
    ]
    if (this.accounts.length > 0) {
      menuItems.push({
        label: 'Account',
        submenu: this.accountSubmenu()
      })
    }
    menuItems.push({
      label: 'Season',
      submenu: this.seasonSubmenu()
    })
    menuItems.push({
      label: 'Tools',
      submenu: [
        this.developerToolsMenuItem()
      ]
    })
    menuItems.push({
      label: 'Help',
      submenu: [
        this.aboutMenuItem(),
        this.bugReportMenuItem()
      ]
    })
    return menuItems
  }

  aboutMenuItem() {
    const self = this

    return {
      label: `About ${app.getName()}`,
      click() { self.onPageChange('about') }
    }
  }

  accountsMenuItem() {
    const self = this

    return {
      label: 'Accounts',
      accelerator: `CmdOrCtrl+A`,
      click() { self.onPageChange('accounts') }
    }
  }

  bugReportMenuItem() {
    const self = this

    return {
      label: 'Report a Bug',
      click() { shell.openExternal(PackageInfo.bugs.url) }
    }
  }

  developerToolsMenuItem() {
    return {
      label: 'Toggle Developer Tools',
      accelerator: `CmdOrCtrl+${this.altOrOption}+I`,
      click(item, win) {
        if (win) {
          win.webContents.toggleDevTools()
        }
      }
    }
  }

  matchesMenuItem() {
    const self = this

    return {
      label: 'Matches',
      accelerator: `CmdOrCtrl+M`,
      click() { self.onPageChange('matches') }
    }
  }

  logMatchMenuItem() {
    const self = this

    return {
      label: 'Log a Match',
      accelerator: `CmdOrCtrl+L`,
      click() { self.onPageChange('log-match') }
    }
  }

  seasonMenuItem(season) {
    const self = this

    return {
      label: `Season ${season}`,
      click() { self.onSeasonChange(season) }
    }
  }

  manageSeasonsMenuItem() {
    const self = this

    return {
      label: 'Manage Seasons',
      click() { self.onPageChange('manage-seasons') }
    }
  }

  seasonSubmenu() {
    const submenu = []
    for (let season = this.latestSeason; season >= 1; season--) {
      submenu.push(this.seasonMenuItem(season))
    }
    submenu.push(this.manageSeasonsMenuItem())
    return submenu
  }

  accountMenuItem(account) {
    const self = this

    return {
      label: account.battletag,
      click() { self.onAccountChange(account._id) }
    }
  }

  accountSubmenu() {
    const submenu = []
    for (const account of this.accounts) {
      submenu.push(this.accountMenuItem(account))
    }
    return submenu
  }

  viewSubmenu() {
    const submenu = [this.accountsMenuItem()]
    if (this.showMatchesMenuItem) {
      submenu.push(this.matchesMenuItem())
    }
    if (this.showLogMatchMenuItem) {
      submenu.push(this.logMatchMenuItem())
    }
    return submenu
  }
}

export default AppMenu