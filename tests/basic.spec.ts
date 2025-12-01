import { test, expect, Page } from '@playwright/test'

async function login(page: Page) {
  // 检查是否在登录页
  const loginTitle = page.getByText('访问验证')
  if (await loginTitle.isVisible()) {
    await page.fill('input[type="password"]', 'kwdb2025')
    await page.getByRole('button', { name: '进入系统' }).click()
    // 等待登录成功（例如等待登录页元素消失或目标元素出现）
    await expect(loginTitle).not.toBeVisible()
  }
}

test('首页列出仪表盘并支持时间选择', async ({ page }) => {
  await page.goto('/community-insight')
  await login(page)
  await expect(page.getByText('KWDB 社区仪表盘')).toBeVisible()
  await expect(page.getByText('近30天')).toBeVisible()
})

test('社区仪表盘加载图表并显示数据或错误', async ({ page }) => {
  await page.goto('/community-insight/dashboards/community')
  await login(page)
  await expect(page.getByText('KWDB 社区仪表盘')).toBeVisible()
  await expect(page.getByText('Docker下载趋势')).toBeVisible({ timeout: 10000 })
})
