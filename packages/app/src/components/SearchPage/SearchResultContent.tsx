import React, {
  FC, useCallback, useEffect, useRef,
} from 'react';
import { useTranslation } from 'react-i18next';

import { DropdownItem } from 'reactstrap';

import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';

import { exportAsMarkdown } from '~/client/services/page-operation';

import RevisionLoader from '../Page/RevisionLoader';
import AppContainer from '../../client/services/AppContainer';
import { smoothScrollIntoView } from '~/client/util/smooth-scroll';
import { GrowiSubNavigation } from '../Navbar/GrowiSubNavigation';
import { SubNavButtons } from '../Navbar/SubNavButtons';
import { AdditionalMenuItemsRendererProps, ForceHideMenuItems } from '../Common/Dropdown/PageItemControl';

import {
  usePageDuplicateModal, usePageRenameModal, usePageDeleteModal,
} from '~/stores/modal';


type AdditionalMenuItemsProps = AdditionalMenuItemsRendererProps & {
  pageId: string,
  revisionId: string,
}

const AdditionalMenuItems = (props: AdditionalMenuItemsProps): JSX.Element => {
  const { t } = useTranslation();

  const { pageId, revisionId } = props;

  return (
    // Export markdown
    <DropdownItem onClick={() => exportAsMarkdown(pageId, revisionId, 'md')}>
      <i className="icon-fw icon-cloud-download"></i>
      {t('export_bulk.export_page_markdown')}
    </DropdownItem>
  );
};

const SCROLL_OFFSET_TOP = 175; // approximate height of (navigation + subnavigation)
const MUTATION_OBSERVER_CONFIG = { childList: true, subtree: true };

type Props ={
  appContainer: AppContainer,
  pageWithMeta : IPageWithMeta<IPageSearchMeta>,
  highlightKeywords?: string[],
  showPageControlDropdown?: boolean,
  forceHideMenuItems?: ForceHideMenuItems,
}

const scrollTo = (scrollElement:HTMLElement) => {
  // use querySelector to intentionally get the first element found
  const highlightedKeyword = scrollElement.querySelector('.highlighted-keyword') as HTMLElement | null;
  if (highlightedKeyword != null) {
    smoothScrollIntoView(highlightedKeyword, SCROLL_OFFSET_TOP, scrollElement);
  }
};

const generateObserverCallback = (doScroll: ()=>void) => {
  return (mutationRecords:MutationRecord[]) => {
    mutationRecords.forEach((record:MutationRecord) => {
      const target = record.target as HTMLElement;
      const targetId = target.id as string;
      if (targetId !== 'wiki') return;
      doScroll();
    });
  };
};

export const SearchResultContent: FC<Props> = (props: Props) => {
  const scrollElementRef = useRef(null);

  // ***************************  Auto Scroll  ***************************
  useEffect(() => {
    const scrollElement = scrollElementRef.current as HTMLElement | null;
    if (scrollElement == null) return;

    const observerCallback = generateObserverCallback(() => {
      scrollTo(scrollElement);
    });

    const observer = new MutationObserver(observerCallback);
    observer.observe(scrollElement, MUTATION_OBSERVER_CONFIG);
    return () => {
      observer.disconnect();
    };
  });
  // *******************************  end  *******************************

  const {
    appContainer,
    pageWithMeta,
    highlightKeywords,
    showPageControlDropdown,
    forceHideMenuItems,
  } = props;

  const page = pageWithMeta?.pageData;
  const { open: openDuplicateModal } = usePageDuplicateModal();
  const { open: openRenameModal } = usePageRenameModal();
  const { open: openDeleteModal } = usePageDeleteModal();

  const growiRenderer = appContainer.getRenderer('searchresult');


  const duplicateItemClickedHandler = useCallback(async(pageId, path) => {
    openDuplicateModal(pageId, path);
  }, [openDuplicateModal]);

  const renameItemClickedHandler = useCallback(async(pageToRename) => {
    openRenameModal(pageToRename);
  }, [openRenameModal]);

  const deleteItemClickedHandler = useCallback((pageToDelete) => {
    openDeleteModal([pageToDelete]);
  }, [openDeleteModal]);

  const ControlComponents = useCallback(() => {
    if (page == null) {
      return <></>;
    }

    const revisionId = typeof page.revision === 'string'
      ? page.revision
      : page.revision._id;

    return (
      <>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
          <SubNavButtons
            pageId={page._id}
            revisionId={revisionId}
            path={page.path}
            showPageControlDropdown={showPageControlDropdown}
            forceHideMenuItems={forceHideMenuItems}
            additionalMenuItemRenderer={props => <AdditionalMenuItems {...props} pageId={page._id} revisionId={revisionId} />}
            isCompactMode
            onClickDuplicateMenuItem={duplicateItemClickedHandler}
            onClickRenameMenuItem={renameItemClickedHandler}
            onClickDeleteMenuItem={deleteItemClickedHandler}
          />
        </div>
        <div className="h-50 d-flex flex-column align-items-end justify-content-center">
        </div>
      </>
    );
  }, [page, showPageControlDropdown, forceHideMenuItems, duplicateItemClickedHandler, renameItemClickedHandler, deleteItemClickedHandler]);

  // return if page is null
  if (page == null) return <></>;

  return (
    <div key={page._id} data-testid="search-result-content" className="search-result-content grw-page-path-text-muted-container d-flex flex-column">
      <div className="grw-subnav-append-shadow-container">
        <GrowiSubNavigation
          page={page}
          controls={ControlComponents}
          isCompactMode
          additionalClasses={['px-4']}
        />
      </div>
      <div className="search-result-content-body-container" ref={scrollElementRef}>
        <RevisionLoader
          growiRenderer={growiRenderer}
          pageId={page._id}
          pagePath={page.path}
          revisionId={page.revision}
          highlightKeywords={highlightKeywords}
        />
      </div>
    </div>
  );
};
