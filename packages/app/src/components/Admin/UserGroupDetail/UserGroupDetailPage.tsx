import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import UserGroupEditForm from './UserGroupEditForm';
import UserGroupUserTable from './UserGroupUserTable';
import UserGroupUserModal from './UserGroupUserModal';
import UserGroupPageList from './UserGroupPageList';
import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';

interface Props extends WithTranslation {
}

class UserGroupDetailPage extends React.Component<Props> {

  render() {
    const { t } = this.props;

    return (
      <div>
        <a href="/admin/user-groups" className="btn btn-outline-secondary">
          <i className="icon-fw ti-arrow-left" aria-hidden="true"></i>
          {t('admin:user_group_management.back_to_list')}
        </a>
        {/* TODO 85062: Link to the ancestors group */}
        <div className="mt-4 form-box">
          <UserGroupEditForm />
        </div>
        <h2 className="admin-setting-header mt-4">{t('admin:user_group_management.user_list')}</h2>
        <UserGroupUserTable />
        <UserGroupUserModal />
        <h2 className="admin-setting-header mt-4">{t('Page')}</h2>
        <div className="page-list">
          <UserGroupPageList />
        </div>
      </div>
    );
  }

}


/**
 * Wrapper component for using unstated
 */
const UserGroupDetailPageWrapper = withUnstatedContainers(withTranslation()(UserGroupDetailPage), [AppContainer]);

export default UserGroupDetailPageWrapper;
