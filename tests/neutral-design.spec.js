import{test,expect}from'@playwright/test';
const color=(p,s,property)=>p.locator(s).first().evaluate((e,k)=>getComputedStyle(e)[k],property);
test('neutral presentation reserves navy for the primary action and keeps readable contrast',async({page})=>{
 await page.goto('/');
 expect(await color(page,'body','backgroundColor')).toBe('rgb(240, 238, 233)');
 expect(await color(page,'.demo-purpose-card','backgroundColor')).toBe('rgb(231, 230, 225)');
 expect(await color(page,'.demo-start','backgroundColor')).toBe('rgb(20, 40, 75)');
 const fg=await color(page,'.visit-step','color'),bg=await color(page,'.demo-purpose-card','backgroundColor');
 const lum=s=>{const a=s.match(/\d+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};
 expect((Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05)).toBeGreaterThan(4.5);
 await page.getByRole('button',{name:'Choose your experience',exact:true}).click();await expect(page.locator('.experience-selection')).toBeVisible();
});
test('workspaces use tinted surfaces rather than decorative brand panels',async({page})=>{
 await page.goto('/?scenario=market&workspace=admin');
 expect(await color(page,'.market-heading','backgroundColor')).toBe('rgb(231, 230, 225)');
 await page.goto('/?scenario=standard&workspace=merchant');
 expect(await color(page,'.sidebar','backgroundColor')).toBe('rgb(245, 242, 236)');
});
