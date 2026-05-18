export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, mode } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'النص فارغ. اكتب نصًا قبل الإرسال.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'مفتاح ANTHROPIC_API_KEY غير موجود في Vercel.' });
    }

    const instructions = {
      grammar: 'صحح الأخطاء الإملائية والنحوية في النص العربي مع الحفاظ على المعنى. أعد النص المصحح فقط.',
      style: 'حسّن أسلوب النص العربي واجعله أكثر سلاسة واحترافية. أعد النص المحسن فقط.',
      simplify: 'بسّط النص العربي واجعله واضحًا وسهل الفهم. أعد النص المبسط فقط.',
      formal: 'حوّل النص العربي إلى أسلوب رسمي ومهذب. أعد النص الرسمي فقط.',
      social: 'حوّل النص العربي إلى منشور مناسب لوسائل التواصل الاجتماعي. أعد المنشور فقط.'
    };

    const instruction = instructions[mode] || instructions.style;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 1200,
  temperature: 0.4,
  system: instruction,
  messages: [
    {
      role: 'user',
      content: text
    }
  ]
})


    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.',
        details: data?.error?.message || data
      });
    }

    const result = data?.content?.[0]?.text || '';

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({
      error: 'حدث خطأ داخلي في الخادم.',
      details: error.message
    });
  }
}
