import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';
import PageContainer from '../../services/PageContainer';
import OutsideShareLinkModal from '../OutsideShareLinkModal';


const PageShareManagement = (props) => {
  const { t, appContainer/* , pageContainer */ } = props;

  const { currentUser } = appContainer;

  const [isOutsideShareLinkModalShown, setIsOutsideShareLinkModalShown] = useState(false);

  function openOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(true);
  }

  function closeOutsideShareLinkModalHandler() {
    setIsOutsideShareLinkModalShown(false);
  }

  function renderModals() {
    return (
      <>
        <OutsideShareLinkModal
          isOpen={isOutsideShareLinkModalShown}
          onClose={closeOutsideShareLinkModalHandler}
        />
      </>
    );
  }

  function renderCurrentUser() {
    return (
      <>
        <a
          role="button"
          className="nav-link bg-transparent dropdown-toggle dropdown-toggle-no-caret"
          href="#"
          data-toggle="dropdown"
        >
          <i className="icon-share"></i>
        </a>
      </>
    );
  }

  function renderGuestUser() {
    return (
      <>
        <a
          role="button"
          className="nav-link bg-transparent dropdown-toggle dropdown-toggle-no-caret dropdown-toggle-disabled"
          href="#"
          id="auth-guest-tltips"
        >
          <i className="icon-share"></i>
        </a>
        <UncontrolledTooltip placement="top" target="auth-guest-tltips">
          {t('Not available for guest')}
        </UncontrolledTooltip>
      </>
    );
  }


  return (
    <>
      {currentUser == null ? renderGuestUser() : renderCurrentUser()}
      <div className="dropdown-menu dropdown-menu-right">
        <button className="dropdown-item" type="button" onClick={openOutsideShareLinkModalHandler}>
          <i className="icon-fw icon-link"></i> {t('Shere this page link to public')}
        </button>
      </div>
      {renderModals()}
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const PageShareManagementWrapper = (props) => {
  return createSubscribedElement(PageShareManagement, props, [AppContainer, PageContainer]);
};


PageShareManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(PageShareManagementWrapper);
