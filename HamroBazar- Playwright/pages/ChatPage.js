const { BasePage } = require('./BasePage');

class ChatPage extends BasePage {
  constructor(page) {
    super(page);
    this.startChatButton = page.getByTestId('detail-chat-button');
    this.chatDialog = page.getByTestId('confirm-dialog');
    this.gotItButton = page.getByRole('button', { name: 'Got it' });
    this.signInLink = page.getByRole('link', { name: /Sign in/i });
  }

  async gotoChatPage() {
    await this.page.goto('/chat');
  }

  async openAdDetail(adPath) {
    await this.page.goto(adPath);
  }

  async openFirstAdFromHome() {
    await this.page.goto('/');
    const detailLink = this.page.locator('a[href*="/detail/"]').first();
    await detailLink.waitFor({ state: 'visible', timeout: 15000 });
    await detailLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickStartChat() {
    await this.startChatButton.click();
  }

  async dismissChatDialog() {
    await this.gotItButton.click();
  }
}

module.exports = { ChatPage };
