import { expect, test } from '@playwright/test';

test.describe('Nike Brasil E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.nike.com.br/', {
      waitUntil: 'domcontentloaded'
    });

    // Se o WAF retornar Access Denied na primeira conexão fria, aguarda e recarrega
    if ((await page.title()) === 'Access Denied') {
      await page.waitForTimeout(2000);
      await page.reload({ waitUntil: 'domcontentloaded' });
    }

    // Aceita cookies caso o banner seja exibido
    const acceptCookies = page.getByRole('button', { name: /aceitar/i });
    if (await acceptCookies.isVisible({ timeout: 4000 }).catch(() => false)) {
      await acceptCookies.click();
    }

    // Fecha modal de boas-vindas / newsletter caso apareça
    const closeModal = page
      .locator(
        '[aria-label="Fechar"], [aria-label="Close"], button:has-text("Fechar")'
      )
      .first();
    if (await closeModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeModal.click();
    }
  });

  test('deve carregar a home da Nike com cabeçalho, logo e navegação', async ({
    page
  }) => {
    await expect(page).toHaveURL(/nike\.com\.br/);
    await expect(page).toHaveTitle(/Nike/i);

    // Valida logo principal da Nike
    const logoNike = page
      .getByRole('banner')
      .getByRole('link', { name: 'Nike', exact: true });
    await expect(logoNike).toBeVisible();

    // Valida campo de busca visível
    const searchInput = page.getByRole('textbox', { name: 'Buscar produtos' });
    await expect(searchInput).toBeVisible();

    // Valida itens principais do menu de navegação
    await expect(
      page.getByRole('link', { name: 'Lançamentos' }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Ofertas' }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Masculino' }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Feminino' }).first()
    ).toBeVisible();
  });

  test('deve buscar por produto e exibir lista de resultados', async ({
    page
  }) => {
    const searchInput = page.getByRole('textbox', { name: 'Buscar produtos' });
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Air Force');
    await searchInput.press('Enter');

    // Valida redirecionamento para página de busca ou catálogo
    await expect(page).toHaveURL(
      /nike\.com\.br\/.*(buscar|busca|snkrs|Air\+Force|air-force)/i
    );

    // Valida elementos da página de busca
    const searchResultHeader = page
      .locator('h1, h2, [data-testid="breadcrumb"]')
      .first();
    await expect(searchResultHeader).toBeVisible();
  });

  test('deve acessar a seção de ofertas e validar catálogo de produtos', async ({
    page
  }) => {
    const ofertasLink = page.getByRole('link', { name: 'Ofertas' }).first();
    await expect(ofertasLink).toBeVisible();

    await ofertasLink.click();

    // Valida URL da seção de ofertas
    await expect(page).toHaveURL(/ofertas/i);

    // Valida que o título principal ou produtos são exibidos
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible();
  });
});
