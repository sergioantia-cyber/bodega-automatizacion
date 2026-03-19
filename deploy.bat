cd C:\Users\DerEine\.gemini\antigravity\scratch\POS_Urena
git add .
git commit -m "Production Build: Fixed all TS errors, added Variants Serial and Size Chart"
git push origin master
cd storefront
npx vercel --prod --yes
