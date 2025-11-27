import { test, expect } from '@playwright/test'

test('首页列出仪表盘并支持时间选择', async ({ page }) => {
  await page.goto('/community-insight')
  await expect(page.getByText('KWDB 社区仪表盘')).toBeVisible()
  await expect(page.getByText('近30天')).toBeVisible()
})

test('社区仪表盘加载图表并显示数据或错误', async ({ page }) => {
  await page.goto('/community-insight/dashboards/community')
  await expect(page.getByText('KWDB 社区仪表盘')).toBeVisible()
  await expect(page.getByText('Docker下载趋势')).toBeVisible({ timeout: 10000 })
})
