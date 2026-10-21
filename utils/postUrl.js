const BASE_URL = (
    process.env.CLIENT_URL || 'https://client-qqq1.vercel.app'
).replace(/\/+$/, '');

// لازم يطابق productsPathes.postsDetails بالكلاينت
const POSTS_PATH = '/posts';

// نفس slugify الكلاينت حرفياً
const slugify = (text = '', maxLength = 60) =>
    String(text)
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, maxLength)
        .replace(/-+$/g, '');

const escapeXml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

// نفس منطق getPostUrl بالكلاينت
const buildPostUrl = (post) => {
    const id = String(post._id);
    const productSlug = slugify(post.product_name ?? '');
    const postSlug = productSlug ? `${productSlug}-${id}` : id;

    const sellerSlug =
        post.seller && typeof post.seller === 'object'
            ? post.seller.slug
            : undefined;

    if (!sellerSlug || !post.category) {
        return `${BASE_URL}${POSTS_PATH}/${encodeURIComponent(postSlug)}`;
    }

    return (
        `${BASE_URL}/${encodeURIComponent(sellerSlug)}` +
        `${POSTS_PATH}/${encodeURIComponent(post.category)}` +
        `/${encodeURIComponent(postSlug)}`
    );
};

module.exports = { BASE_URL, slugify, escapeXml, buildPostUrl };