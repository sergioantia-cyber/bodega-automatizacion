import * as fs from 'fs'

async function tryScrape() {
  const apiKey = '9d2ee5c0d1887abd64980c00ff92c1cd87fce72d'
  const targetUrl = 'https://www.temu.com/mens-trendy-high-top-fashion-sneakers-comfortable-wear-resistant-basketball-shoes-for-outdoor-sports-running-shoes-g-601099513360677.html' 
  
  const zenUrl = `https://api.zenrows.com/v1/?apikey=${apiKey}&url=${encodeURIComponent(targetUrl)}&js_render=true&antibot=true`
  
  try {
    const res = await fetch(zenUrl)
    const text = await res.text()
    fs.writeFileSync('temu_test.html', text)
  } catch (err) {
    console.error(err)
  }
}

tryScrape()
