import * as fs from 'fs'

async function tryScrape() {
  const apiKey = '9d2ee5c0d1887abd64980c00ff92c1cd87fce72d'
  const targetUrl = 'https://www.temu.com/co/zapatos-de-mujer-zapatos-unisex-para-pareja-zapatillas-casuales-malla-transpirable-comodos-de-llevar-adecuados-para-actividades-al-aire-libre-correr-caminar--para-regalar-g-606531739297885.html' 
  
  const zenUrl = `https://api.zenrows.com/v1/?apikey=${apiKey}&url=${encodeURIComponent(targetUrl)}&js_render=true&antibot=true&premium_proxy=true&proxy_country=co&wait=5000`
  
  try {
    const res = await fetch(zenUrl)
    const text = await res.text()
    fs.writeFileSync('temu_test_shoes.html', text)
    console.log("HTML saved to temu_test_shoes.html")
  } catch (err) {
    console.error(err)
  }
}

tryScrape()
