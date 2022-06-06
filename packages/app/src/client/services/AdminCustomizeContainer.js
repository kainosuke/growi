import { Container } from 'unstated';

import { AttachmentType } from '~/server/interfaces/attachment';
import loggerFactory from '~/utils/logger';

import { toastError } from '../util/apiNotification';
import { apiPost } from '../util/apiv1-client';
import { apiv3Get, apiv3Put } from '../util/apiv3-client';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:services:AdminCustomizeContainer');

const DEFAULT_LOGO = '/images/logo.svg';
/**
 * Service container for admin customize setting page (Customize.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminCustomizeContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyCurrentTheme = 0;
    this.dummyCurrentThemeForError = 1;

    this.state = {
      retrieveError: null,
      // set dummy value tile for using suspense
      currentTheme: this.dummyCurrentTheme,
      isEnabledTimeline: false,
      isSavedStatesOfTabChanges: false,
      isEnabledAttachTitleHeader: false,

      pageLimitationS: null,
      pageLimitationM: null,
      pageLimitationL: null,
      pageLimitationXL: null,

      isEnabledStaleNotification: false,
      isAllReplyShown: false,
      isSearchScopeChildrenAsDefault: false,
      currentHighlightJsStyleId: '',
      isHighlightJsStyleBorderEnabled: false,
      currentCustomizeTitle: '',
      currentCustomizeHeader: '',
      currentCustomizeCss: '',
      currentCustomizeScript: '',
      /* eslint-disable quote-props, no-multi-spaces */
      highlightJsCssSelectorOptions: {
        'github':           { name: '[Light] GitHub',         border: false },
        'github-gist':      { name: '[Light] GitHub Gist',    border: true },
        'atom-one-light':   { name: '[Light] Atom One Light', border: true },
        'xcode':            { name: '[Light] Xcode',          border: true },
        'vs':               { name: '[Light] Vs',             border: true },
        'atom-one-dark':    { name: '[Dark] Atom One Dark',   border: false },
        'hybrid':           { name: '[Dark] Hybrid',          border: false },
        'monokai':          { name: '[Dark] Monokai',         border: false },
        'tomorrow-night':   { name: '[Dark] Tomorrow Night',  border: false },
        'vs2015':           { name: '[Dark] Vs 2015',         border: false },
      },
      uploadedLogoSrc: null,
      defaultLogoSrc: DEFAULT_LOGO,
      isDefaultLogo: true,
      brandLogoAttachmentId: '',
      /* eslint-enable quote-props, no-multi-spaces */
    };
    this.switchPageListLimitationS = this.switchPageListLimitationS.bind(this);
    this.switchPageListLimitationM = this.switchPageListLimitationM.bind(this);
    this.switchPageListLimitationL = this.switchPageListLimitationL.bind(this);
    this.switchPageListLimitationXL = this.switchPageListLimitationXL.bind(this);
    this.deleteLogo = this.deleteLogo.bind(this);
    this.uploadBrandLogo = this.uploadBrandLogo.bind(this);

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminCustomizeContainer';
  }

  /**
   * retrieve customize data
   */
  async retrieveCustomizeData() {
    try {
      const response = await apiv3Get('/customize-setting/');
      const { customizeParams } = response.data;

      this.setState({
        currentTheme: customizeParams.themeType,
        isEnabledTimeline: customizeParams.isEnabledTimeline,
        isSavedStatesOfTabChanges: customizeParams.isSavedStatesOfTabChanges,
        isEnabledAttachTitleHeader: customizeParams.isEnabledAttachTitleHeader,
        pageLimitationS: customizeParams.pageLimitationS,
        pageLimitationM: customizeParams.pageLimitationM,
        pageLimitationL: customizeParams.pageLimitationL,
        pageLimitationXL: customizeParams.pageLimitationXL,
        isEnabledStaleNotification: customizeParams.isEnabledStaleNotification,
        isAllReplyShown: customizeParams.isAllReplyShown,
        isSearchScopeChildrenAsDefault: customizeParams.isSearchScopeChildrenAsDefault,
        currentHighlightJsStyleId: customizeParams.styleName,
        isHighlightJsStyleBorderEnabled: customizeParams.styleBorder,
        currentCustomizeTitle: customizeParams.customizeTitle,
        currentCustomizeHeader: customizeParams.customizeHeader,
        currentCustomizeCss: customizeParams.customizeCss,
        currentCustomizeScript: customizeParams.customizeScript,
        brandLogoAttachmentId: customizeParams.brandLogoAttachmentId,
        isDefaultLogo: customizeParams.isDefaultLogo,
        uploadedLogoSrc: customizeParams.uploadedLogoSrc,
      });
      // search style name from object for display
      this.setState({ currentHighlightJsStyleName: this.state.highlightJsCssSelectorOptions[customizeParams.styleName].name });

    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to fetch data');
    }
  }

  /**
   * Switch themeType
   */
  switchThemeType(themeName) {
    this.setState({ currentTheme: themeName });

    // preview if production
    if (process.env.NODE_ENV !== 'development') {
      this.previewTheme(themeName);
    }
  }

  /**
   * Switch enabledTimeLine
   */
  switchEnableTimeline() {
    this.setState({ isEnabledTimeline:  !this.state.isEnabledTimeline });
  }

  /**
   * Switch savedStatesOfTabChanges
   */
  switchSavedStatesOfTabChanges() {
    this.setState({ isSavedStatesOfTabChanges:  !this.state.isSavedStatesOfTabChanges });
  }

  /**
   * Switch enabledAttachTitleHeader
   */
  switchEnabledAttachTitleHeader() {
    this.setState({ isEnabledAttachTitleHeader:  !this.state.isEnabledAttachTitleHeader });
  }


  /**
   * S: Switch pageListLimitationS
   */
  switchPageListLimitationS(value) {
    this.setState({ pageLimitationS: value });
  }

  /**
   * M: Switch pageListLimitationM
   */
  switchPageListLimitationM(value) {
    this.setState({ pageLimitationM: value });
  }

  /**
   * L: Switch pageListLimitationL
   */
  switchPageListLimitationL(value) {
    this.setState({ pageLimitationL: value });
  }

  /**
   * XL: Switch pageListLimitationXL
   */
  switchPageListLimitationXL(value) {
    this.setState({ pageLimitationXL: value });
  }

  /**
   * Switch enabledStaleNotification
   */
  switchEnableStaleNotification() {
    this.setState({ isEnabledStaleNotification:  !this.state.isEnabledStaleNotification });
  }

  /**
   * Switch isAllReplyShown
   */
  switchIsAllReplyShown() {
    this.setState({ isAllReplyShown: !this.state.isAllReplyShown });
  }

  /**
   * Switch isSearchScopeChildrenAsDefault
   */
  switchIsSearchScopeChildrenAsDefault() {
    this.setState({ isSearchScopeChildrenAsDefault: !this.state.isSearchScopeChildrenAsDefault });
  }

  /**
   * Switch highlightJsStyle
   */
  switchHighlightJsStyle(styleId, styleName, isBorderEnable) {
    this.setState({ currentHighlightJsStyleId: styleId });
    this.setState({ currentHighlightJsStyleName: styleName });
    // recommended settings are applied
    this.setState({ isHighlightJsStyleBorderEnabled: isBorderEnable });

    this.previewHighlightJsStyle(styleId);
  }

  /**
   * Switch highlightJsStyleBorder
   */
  switchHighlightJsStyleBorder() {
    this.setState({ isHighlightJsStyleBorderEnabled: !this.state.isHighlightJsStyleBorderEnabled });
  }

  /**
   * Change customize Title
   */
  changeCustomizeTitle(inputValue) {
    this.setState({ currentCustomizeTitle: inputValue });
  }

  /**
   * Change customize Html header
   */
  changeCustomizeHeader(inputValue) {
    this.setState({ currentCustomizeHeader: inputValue });
  }

  /**
   * Change customize css
   */
  changeCustomizeCss(inputValue) {
    this.setState({ currentCustomizeCss: inputValue });
  }

  /**
   * Change customize script
   */
  changeCustomizeScript(inpuValue) {
    this.setState({ currentCustomizeScript: inpuValue });
  }

  /**
   * Preview theme
   * @param {string} themeName
   */
  async previewTheme(themeName) {
    try {
      // get theme asset path
      const response = await apiv3Get('/customize-setting/theme/asset-path', { themeName });
      const { assetPath } = response.data;

      const themeLink = document.getElementById('grw-theme-link');
      themeLink.setAttribute('href', assetPath);
    }
    catch (err) {
      toastError(err);
    }
  }

  /**
   * Preview hljs style
   * @param {string} styleId
   */
  previewHighlightJsStyle(styleId) {
    const styleLInk = document.querySelectorAll('#grw-hljs-container-for-demo link')[0];
    // replace css url
    // see https://regex101.com/r/gBNZYu/4
    styleLInk.href = styleLInk.href.replace(/[^/]+\.css$/, `${styleId}.css`);
  }

  /**
   * Update theme
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeTheme() {
    try {
      const response = await apiv3Put('/customize-setting/theme', {
        themeType: this.state.currentTheme,
      });
      const { customizedParams } = response.data;
      this.setState({
        themeType: customizedParams.themeType,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update function
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeFunction() {
    try {
      const response = await apiv3Put('/customize-setting/function', {
        isEnabledTimeline: this.state.isEnabledTimeline,
        isSavedStatesOfTabChanges: this.state.isSavedStatesOfTabChanges,
        isEnabledAttachTitleHeader: this.state.isEnabledAttachTitleHeader,
        pageLimitationS: this.state.pageLimitationS,
        pageLimitationM: this.state.pageLimitationM,
        pageLimitationL: this.state.pageLimitationL,
        pageLimitationXL: this.state.pageLimitationXL,
        isEnabledStaleNotification: this.state.isEnabledStaleNotification,
        isAllReplyShown: this.state.isAllReplyShown,
        isSearchScopeChildrenAsDefault: this.state.isSearchScopeChildrenAsDefault,
      });
      const { customizedParams } = response.data;
      this.setState({
        isEnabledTimeline: customizedParams.isEnabledTimeline,
        isSavedStatesOfTabChanges: customizedParams.isSavedStatesOfTabChanges,
        isEnabledAttachTitleHeader: customizedParams.isEnabledAttachTitleHeader,
        pageLimitationS: customizedParams.pageLimitationS,
        pageLimitationM: customizedParams.pageLimitationM,
        pageLimitationL: customizedParams.pageLimitationL,
        pageLimitationXL: customizedParams.pageLimitationXL,
        isEnabledStaleNotification: customizedParams.isEnabledStaleNotification,
        isAllReplyShown: customizedParams.isAllReplyShown,
        isSearchScopeChildrenAsDefault: customizedParams.isSearchScopeChildrenAsDefault,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update code highlight
   * @memberOf AdminCustomizeContainer
   */
  async updateHighlightJsStyle() {
    try {
      const response = await apiv3Put('/customize-setting/highlight', {
        highlightJsStyle: this.state.currentHighlightJsStyleId,
        highlightJsStyleBorder: this.state.isHighlightJsStyleBorderEnabled,
      });
      const { customizedParams } = response.data;
      this.setState({
        highlightJsStyle: customizedParams.highlightJsStyle,
        highlightJsStyleBorder: customizedParams.highlightJsStyleBorder,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customTitle
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeTitle() {
    try {
      const response = await apiv3Put('/customize-setting/customize-title', {
        customizeTitle: this.state.currentCustomizeTitle,
      });
      const { customizedParams } = response.data;
      this.setState({
        customizeTitle: customizedParams.customizeTitle,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customHeader
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeHeader() {
    try {
      const response = await apiv3Put('/customize-setting/customize-header', {
        customizeHeader: this.state.currentCustomizeHeader,
      });
      const { customizedParams } = response.data;
      this.setState({
        currentCustomizeHeader: customizedParams.customizeHeader,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customCss
   * @memberOf AdminCustomizeContainer
   */
  async updateCustomizeCss() {
    try {
      const response = await apiv3Put('/customize-setting/customize-css', {
        customizeCss: this.state.currentCustomizeCss,
      });
      const { customizedParams } = response.data;
      this.setState({
        currentCustomizeCss: customizedParams.customizeCss,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

  /**
   * Update customize script
   * @memberOf AdminCustomizeContainer
   * @return {string} Customize scripts
   */
  async updateCustomizeScript() {
    try {
      const response = await apiv3Put('/customize-setting/customize-script', {
        customizeScript: this.state.currentCustomizeScript,
      });
      const { customizedParams } = response.data;
      this.setState({
        currentCustomizeScript: customizedParams.customizeScript,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }


  async deleteLogo() {
    try {
      const formData = {
        _csrf:  this.appContainer.csrfToken,
        brandLogoAttachmentId: this.state.brandLogoAttachmentId,
      };
      await apiPost('/attachments.removeBrandLogo', formData);
      this.setState({
        uploadedLogoSrc: null,
        brandLogoAttachmentId: null,
      });

    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to delete logo');
    }
  }

  async uploadBrandLogo(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('_csrf', this.appContainer.csrfToken);
      formData.append('attachmentType', AttachmentType.BRAND_LOGO);
      formData.append('brandLogoAttachmentId', this.state.brandLogoAttachmentId);
      const response = await apiPost('/attachments.uploadBrandLogo', formData);

      this.setState({
        uploadedLogoSrc: response.attachment.filePathProxied,
        brandLogoAttachmentId: response.attachment.id,
      });
    }
    catch (err) {
      this.setState({ retrieveError: err });
      logger.error(err);
      throw new Error('Failed to upload brand logo');
    }
  }

  switchDefaultLogo() {
    this.setState({ isDefaultLogo: !this.state.isDefaultLogo });
  }

  async updateCustomizeLogo() {
    try {
      const response = await apiv3Put('/customize-setting/customize-logo', {
        isDefaultLogo: this.state.isDefaultLogo,
        brandLogoAttachmentId: this.state.brandLogoAttachmentId,
        uploadedLogoSrc: this.state.uploadedLogoSrc,
      });
      const { customizedParams } = response.data;
      this.setState({
        isDefaultLogo: customizedParams.isDefaultLogo,
        brandLogoAttachmentId:  customizedParams.brandLogoAttachmentId,
        uploadedLogoSrc: customizedParams.uploadedLogoSrc,
      });
    }
    catch (err) {
      logger.error(err);
      throw new Error('Failed to update data');
    }
  }

}
