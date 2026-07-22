const { test, expect } = require('@playwright/test');
const { ChatPage } = require('../pages/ChatPage');

const SAMPLE_AD =
  '/detail/accessories/dji-osmo-pocket-3-brand-new-box-sealed-pack-in-new-road-gate-nac-kathmandu-22-kathmandu/8EE9095D-11BB-1304-096A-E2B1379BBD8D';

test.describe('HamroBazar Chat', () => {
  test('chat page loads', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.gotoChatPage();

    await expect(page).toHaveURL(/\/chat/);
    await expect(page).toHaveTitle(/Hamrobazar/i);
  });

  test('ad detail page shows Start a chat button', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openAdDetail(SAMPLE_AD);

    await expect(chatPage.startChatButton).toBeVisible();
    await expect(chatPage.startChatButton).toHaveText(/Start a chat/i);
  });

  test('clicking Start a chat shows under construction message', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openAdDetail(SAMPLE_AD);
    await chatPage.clickStartChat();

    await expect(chatPage.chatDialog).toBeVisible();
    await expect(chatPage.chatDialog).toContainText(/Under construction/i);
    await expect(chatPage.chatDialog).toContainText(/working on the chat feature/i);
    await expect(chatPage.gotItButton).toBeVisible();
  });

  test('Got it button closes the chat dialog', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openAdDetail(SAMPLE_AD);
    await chatPage.clickStartChat();

    await expect(chatPage.chatDialog).toBeVisible();
    await chatPage.dismissChatDialog();
    await expect(chatPage.chatDialog).toBeHidden();
  });

  test('Start a chat is available from homepage ad listing', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openFirstAdFromHome();

    await expect(page).toHaveURL(/\/detail\//);
    await expect(chatPage.startChatButton).toBeVisible();
  });

  test('chat page shows sign in option for guests', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.gotoChatPage();

    await expect(chatPage.signInLink).toBeVisible();
  });
});
