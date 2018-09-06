/* global cozy  */
import styles from '../styles/topbar'

import React, { Component } from 'react'
import { translate } from 'cozy-ui/react/I18n'
import { withBreakpoints } from 'cozy-ui/react'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import flow from 'lodash/flow'

const { BarCenter, BarRight } = cozy.bar

const KEYCODE_ENTER = 13
const KEYCODE_ESC = 27

class EditableAlbumName extends Component {
  constructor(props) {
    super(props)
    this.ignoreBlurEvent = false // we'll ignore blur events if they are triggered by pressing enter or escape, to prevent `onEdit` from firing twice
    this.inputElement = null
  }

  componentDidMount() {
    if (this.inputElement !== null) {
      this.inputElement.focus()
      this.inputElement.select()
    }
  }

  handleBlur = e => {
    if (!this.ignoreBlurEvent && this.props.onEdit)
      this.props.onEdit(
        e.target.value.trim() !== '' ? e.target.value : this.props.albumName
      )
  }

  handleKeyDown = e => {
    if (e.keyCode === KEYCODE_ENTER && this.props.onEdit) {
      this.ignoreBlurEvent = true
      this.props.onEdit(e.target.value)
    } else if (e.keyCode === KEYCODE_ESC && this.props.onEdit) {
      this.ignoreBlurEvent = true
      this.props.onEdit(this.props.albumName)
    }
  }

  render() {
    const { albumName } = this.props
    return (
      <input
        type="text"
        value={albumName}
        onKeyDown={this.handleKeyDown}
        onBlur={this.handleBlur}
        ref={elem => {
          this.inputElement = elem
        }}
      />
    )
  }
}

EditableAlbumName.propTypes = {
  albumName: PropTypes.string,
  onEdit: PropTypes.func.isRequired
}

const TopbarTitle = ({ children }) => (
  <h2 className={styles['pho-content-title']}>{children}</h2>
)

const BackToAlbumsButton = withRouter(({ router }) => {
  const url = router.location.pathname
  const parentUrl = url.substring(0, url.lastIndexOf('/'))
  const onClick = () => router.push(parentUrl)

  return (
    <div
      role="button"
      className={styles['pho-content-album-previous']}
      onClick={onClick}
    />
  )
})

BackToAlbumsButton.propTypes = {
  router: PropTypes.object.isRequired
}

class Topbar extends Component {
  renderTitle() {
    const { t, viewName, albumName = '', onEdit, editing = false } = this.props
    const isAlbumContent = viewName === 'albumContent'

    if (!isAlbumContent) return t(`Nav.${viewName}`)
    else if (editing)
      return <EditableAlbumName albumName={albumName} onEdit={onEdit} />
    else return albumName
  }

  render() {
    const { children, viewName, breakpoints: { isMobile } } = this.props
    const isAlbumContent = viewName === 'albumContent'
    const title = <TopbarTitle>{this.renderTitle()}</TopbarTitle>
    const responsiveTitle = isMobile ? <BarCenter>{title}</BarCenter> : title

    const responsiveMenu = isMobile ? <BarRight>{children}</BarRight> : children

    return (
      <div className={styles['pho-content-header']}>
        {isAlbumContent && <BackToAlbumsButton />}
        {responsiveTitle}
        {responsiveMenu}
      </div>
    )
  }
}

Topbar.propTypes = {
  viewName: PropTypes.string.isRequired,
  albumName: PropTypes.string,
  t: PropTypes.func.isRequired,
  editing: PropTypes.bool,
  onEdit: PropTypes.func,
  breakpoints: PropTypes.object.isRequired,
  children: PropTypes.node
}

Topbar.defaultProps = {
  editing: false,
  onEdit: () => {}
}

export default flow(withBreakpoints(), translate())(Topbar)
