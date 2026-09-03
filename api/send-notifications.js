export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, category, articleId } = req.body;
  const articleLink = `https://naijainsights.vercel.app/article.html?id=${articleId}`;

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id: '4ceb2d9b-1e63-41fd-ae04-f3ee3c2b7dfd',
        included_segments: ['All'],
        headings: { en: '📰 ' + title },
        contents: { en: 'New ' + category + ' story on Naija Insights' },
        url: articleLink,
        chrome_web_icon: 'https://iili.io/n98EJ5v.png',
        firefox_icon: 'https://iili.io/n98EJ5v.png'
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}