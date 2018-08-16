/* global __TARGET__ */

import styles from '../styles/nav'

import React, { Component } from 'react'
import { translate } from 'cozy-ui/react/I18n'

import { Link } from 'react-router'

import Icon from 'cozy-ui/react/Icon'

class Nav extends Component {
  render() {
    const { t } = this.props

    return (
      <nav>
        <ul className={styles['c-nav']}>
          <li className={styles['c-nav-item']}>
            <Link
              to={{ pathname: '/folder' }}
              className={styles['c-nav-link']}
              activeClassName={styles['is-active']}
            >
              <span className={styles['c-nav-icon']}>
                <Icon icon="folder" />
              </span>
              <span className={styles['c-nav-text']}>
                {t('Nav.item_drive')}
              </span>
            </Link>
          </li>
          <li className={styles['c-nav-item']}>
            <Link
              to="/recent"
              className={styles['c-nav-link']}
              activeClassName={styles['is-active']}
            >
              <span className={styles['c-nav-icon']}>
                <Icon icon="clock" />
              </span>
              <span className={styles['c-nav-text']}>
                {t('Nav.item_recent')}
              </span>
            </Link>
          </li>
          <li className={styles['c-nav-item']}>
            <Link
              to="/sharings"
              className={styles['c-nav-link']}
              activeClassName={styles['is-active']}
            >
              <span className={styles['c-nav-icon']}>
                <Icon icon="share" />
              </span>
              <span className={styles['c-nav-text']}>
                {t('Nav.item_sharings')}
              </span>
            </Link>
          </li>
          <li className={styles['c-nav-item']}>
            <Link
              to="/trash"
              className={styles['c-nav-link']}
              activeClassName={styles['is-active']}
            >
              <span className={styles['c-nav-icon']}>
                <Icon icon="trash" />
              </span>
              <span className={styles['c-nav-text']}>
                {t('Nav.item_trash')}
              </span>
            </Link>
          </li>
          {__TARGET__ === 'mobile' && (
            <li className={styles['c-nav-item']}>
              <Link
                to="/settings"
                className={styles['c-nav-link']}
                activeClassName={styles['is-active']}
              >
                <span className={styles['c-nav-icon']}>
                  <Icon icon="gear" />
                </span>
                <span className={styles['c-nav-text']}>
                  {t('Nav.item_settings')}
                </span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    )
  }
}

export default translate()(Nav)
