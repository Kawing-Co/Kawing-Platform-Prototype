import {test,expect} from '@playwright/test';
test('compact introduction has finite motion and manual story without pause control',async({page})=>{
 await page.goto('/');await expect(page.locator('.motion-control')).toHaveCount(0);
 await expect(page.locator('.connection-badge .motion-glyph')).toHaveAttribute('data-lottie-state','complete');
 await page.getByRole('button',{name:/03 Bring it together/}).click();await expect(page.locator('.visit-preview')).toContainText('Admin perspective');
 await page.getByRole('button',{name:'Choose your experience',exact:true}).click();await expect(page.locator('.experience-selection')).toBeVisible();
});
for(const [width,height]of[[360,640],[390,844],[768,1024],[1440,900]])test(`introduction fits ${width}x${height}`,async({page})=>{
 await page.setViewportSize({width,height});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.getByRole('button',{name:'Choose your experience',exact:true})).toBeInViewport();
});
test('reduced motion preserves static icons and entry',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('.motion-vector svg')).toHaveCount(0);
 await page.getByRole('button',{name:'Choose your experience',exact:true}).click();await expect(page).toHaveURL(/screen=experiences/);
});
