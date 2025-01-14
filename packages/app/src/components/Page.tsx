import React, {
  useCallback,
  useEffect, useRef,
} from 'react';

import EventEmitter from 'events';

import { DrawioEditByViewerProps } from '@growi/remark-drawio-plugin';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { HtmlElementNode } from 'rehype-toc';

import { useSaveOrUpdate } from '~/client/services/page-operation';
import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { OptionsToSave } from '~/interfaces/page-operation';
import {
  useIsGuestUser, useShareLinkId,
} from '~/stores/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useDrawioModal } from '~/stores/modal';
import { useSWRxCurrentPage, useSWRxTagsInfo } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import {
  useCurrentPageTocNode,
  useIsMobile,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './Page/RevisionRenderer';
import mdu from './PageEditor/MarkdownDrawioUtil';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

// const DrawioModal = dynamic(() => import('./PageEditor/DrawioModal'), { ssr: false });
const GridEditModal = dynamic(() => import('./PageEditor/GridEditModal'), { ssr: false });
const LinkEditModal = dynamic(() => import('./PageEditor/LinkEditModal'), { ssr: false });

const logger = loggerFactory('growi:Page');


export const Page = (props) => {
  const { t } = useTranslation();

  // Pass tocRef to generateViewOptions (=> rehypePlugin => customizeTOC) to call mutateCurrentPageTocNode when tocRef.current changes.
  // The toc node passed by customizeTOC is assigned to tocRef.current.
  const tocRef = useRef<HtmlElementNode>();

  const storeTocNodeHandler = useCallback((toc: HtmlElementNode) => {
    tocRef.current = toc;
  }, []);

  const { data: shareLinkId } = useShareLinkId();
  const { data: currentPage, mutate: mutateCurrentPage } = useSWRxCurrentPage(shareLinkId ?? undefined);
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();
  const { data: tagsInfo } = useSWRxTagsInfo(currentPage?._id);
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isMobile } = useIsMobile();
  const { data: rendererOptions } = useViewOptions(storeTocNodeHandler);
  const { mutate: mutateCurrentPageTocNode } = useCurrentPageTocNode();
  const { open: openDrawioModal } = useDrawioModal();

  const saveOrUpdate = useSaveOrUpdate();


  useEffect(() => {
    mutateCurrentPageTocNode(tocRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutateCurrentPageTocNode, tocRef.current]); // include tocRef.current to call mutateCurrentPageTocNode when tocRef.current changes


  const saveByDrawioModal = useCallback(async(drawioMxFile: string, bol: number, eol: number) => {
    if (currentPage == null || tagsInfo == null) {
      return;
    }

    const currentMarkdown = currentPage.revision.body;
    const optionsToSave: OptionsToSave = {
      isSlackEnabled: false,
      slackChannels: '',
      grant: currentPage.grant,
      grantUserGroupId: currentPage.grantedGroup?._id,
      grantUserGroupName: currentPage.grantedGroup?.name,
      pageTags: tagsInfo.tags,
    };

    const newMarkdown = mdu.replaceDrawioInMarkdown(drawioMxFile, currentMarkdown, bol, eol);

    try {
      const currentRevisionId = currentPage.revision._id;
      await saveOrUpdate(
        newMarkdown,
        { pageId: currentPage._id, path: currentPage.path, revisionId: currentRevisionId },
        optionsToSave,
      );

      toastSuccess(t('toaster.save_succeeded'));

      // rerender
      mutateCurrentPage();
      mutateEditingMarkdown(newMarkdown);
    }
    catch (error) {
      logger.error('failed to save', error);
      toastError(error);
    }
  }, [currentPage, mutateCurrentPage, mutateEditingMarkdown, saveOrUpdate, t, tagsInfo]);

  // set handler to open DrawioModal
  useEffect(() => {
    const handler = (data: DrawioEditByViewerProps) => {
      openDrawioModal(data.drawioMxFile, drawioMxFile => saveByDrawioModal(drawioMxFile, data.bol, data.eol));
    };
    globalEmitter.on('launchDrawioModal', handler);

    return function cleanup() {
      globalEmitter.removeListener('launchDrawioModal', handler);
    };
  }, [openDrawioModal, saveByDrawioModal]);

  if (currentPage == null || isGuestUser == null || rendererOptions == null) {
    const entries = Object.entries({
      currentPage, isGuestUser, rendererOptions,
    })
      .map(([key, value]) => [key, value == null ? 'null' : undefined])
      .filter(([, value]) => value != null);

    logger.warn('Some of materials are missing.', Object.fromEntries(entries));
    return null;
  }

  const { _id: revisionId, body: markdown } = currentPage.revision;

  return (
    <div className={`mb-5 ${isMobile ? 'page-mobile' : ''}`}>

      { revisionId != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
      )}

      { !isGuestUser && (
        <>
          <GridEditModal />
          <LinkEditModal />
        </>
      )}
    </div>
  );

};
