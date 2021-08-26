import { Container } from 'unstated';

/**
 * Service container for admin LegacySlackIntegration setting page (LegacySlackIntegration.jsx)
 * @extends {Container} unstated Container
 */
export default class AdminSlackIntegrationLegacyContainer extends Container {

  constructor(appContainer) {
    super();

    this.appContainer = appContainer;
    this.dummyWebhookUrl = 0;
    this.dummyWebhookUrlForError = 1;

    this.state = {
      retrieveError: null,
      selectSlackOption: 'Incoming Webhooks',
      webhookUrl: this.dummyWebhookUrl,
      isIncomingWebhookPrioritized: false,
      slackToken: '',
    };

  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AdminSlackIntegrationLegacyContainer';
  }

  /**
   * Retrieve notificationData
   */
  async retrieveData() {
    const response = await this.appContainer.apiv3.get('/slack-integration-legacy-settings/');
    const { slackIntegrationParams } = response.data;

    this.setState({
      isSlackbotConfigured: slackIntegrationParams.isSlackbotConfigured,
      webhookUrl: slackIntegrationParams.webhookUrl,
      isIncomingWebhookPrioritized: slackIntegrationParams.isIncomingWebhookPrioritized,
      slackToken: slackIntegrationParams.slackToken,
    });
  }

  /**
   * Switch slackOption
   */
  switchSlackOption(slackOption) {
    this.setState({ selectSlackOption: slackOption });
  }

  /**
   * Change webhookUrl
   */
  changeWebhookUrl(webhookUrl) {
    this.setState({ webhookUrl });
  }

  /**
   * Switch incomingWebhookPrioritized
   */
  switchIsIncomingWebhookPrioritized() {
    this.setState({ isIncomingWebhookPrioritized: !this.state.isIncomingWebhookPrioritized });
  }

  /**
   * Change slackToken
   */
  changeSlackToken(slackToken) {
    this.setState({ slackToken });
  }

  /**
   * Update slackAppConfiguration
   * @memberOf SlackAppConfiguration
   */
  async updateSlackAppConfiguration() {
    const response = await this.appContainer.apiv3.put('/slack-integration-legacy-settings/', {
      webhookUrl: this.state.webhookUrl,
      isIncomingWebhookPrioritized: this.state.isIncomingWebhookPrioritized,
      slackToken: this.state.slackToken,
    });

    return response;
  }

}
