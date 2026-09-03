export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const {
      title,
      category,
      articleId,
      articleUrl,
      imageUrl
    } = req.body || {};

    // Validate required information
    if (!title || !articleId) {
      return res.status(400).json({
        success: false,
        error: 'Title and articleId are required'
      });
    }

    // Make sure the API key exists on Vercel
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!apiKey) {
      console.error('ONESIGNAL_REST_API_KEY is not configured');

      return res.status(500).json({
        success: false,
        error: 'OneSignal API key is not configured'
      });
    }

    const siteUrl = 'https://naijainsights.workwithadggraphics.workers.dev';

    const finalArticleUrl =
      articleUrl ||
      `${siteUrl}/article.html?id=${encodeURIComponent(articleId)}`;

    const notification = {
      app_id: process.env.ONESIGNAL_APP_ID,

      target_channel: 'push',

      included_segments: ['Subscribed Users'],

      headings: {
        en: '📰 New on Naija Insights'
      },

      contents: {
        en: title
      },

      url: finalArticleUrl,

      ...(imageUrl
        ? {
            chrome_web_image: imageUrl,
            chrome_web_icon: imageUrl
          }
        : {})
    };

    const response = await fetch(
      'https://api.onesignal.com/notifications',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKey}`
        },
        body: JSON.stringify(notification)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('OneSignal error:', data);

      return res.status(response.status).json({
        success: false,
        error: 'OneSignal rejected the notification',
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      onesignal: data
    });

  } catch (error) {
    console.error('Notification endpoint error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}