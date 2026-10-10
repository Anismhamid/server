const SavedSearch = require('../models/SavedSearch');
const SavedSearchMatch = require('../models/SavedSearchMatch');
const { notifyUser } = require('./notify');

const normalize = (value) =>
    String(value ?? '')
        .trim()
        .toLocaleLowerCase()
        .replace(/\s+/g, ' ');

// تصحيح الهروب من الرموز الخاصة في البحث النصي.
const escapeRegex = (value) =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// توحيد بعض أسماء الفئات المتداولة.
const CATEGORY_ALIASES = {
    phones: ['phones', 'phone', 'mobile phones', 'cell phones'],
    smartphones: ['smartphones', 'smartphone', 'mobile phones', 'cell phones'],
};

const getCategoryVariants = (value) => {
    const normalized = normalize(value);

    if (!normalized) {
        return [];
    }

    const aliases = Object.values(CATEGORY_ALIASES).find((group) =>
        group.some((alias) => normalize(alias) === normalized),
    );

    return aliases
        ? [...new Set(aliases.map(normalize))]
        : [normalized];
};

const sameCategory = (first, second) => {
    const firstVariants = getCategoryVariants(first);
    const secondVariants = getCategoryVariants(second);

    return firstVariants.some((value) => secondVariants.includes(value));
};

const matchesSearch = (search, post) => {
    const postSubcategory = post.subcategory ?? post.subCategory;

    // 1. مطابقة الفئة الرئيسية أو الفرعية أو النوع.
    if (search.category) {
        const categoryMatches = [
            post.category,
            postSubcategory,
            post.type,
        ].some((postCategory) =>
            sameCategory(search.category, postCategory),
        );

        if (!categoryMatches) {
            return false;
        }
    }

    // 2. مطابقة الفئة الفرعية.
    if (search.subCategory) {
        const subcategoryMatches = [
            postSubcategory,
            post.type,
        ].some((postSubcategoryValue) =>
            sameCategory(search.subCategory, postSubcategoryValue),
        );

        if (!subcategoryMatches) {
            return false;
        }
    }

    // 3. مطابقة السعر.
    const price = Number(post.price);
    const hasMinPrice = search.minPrice != null;
    const hasMaxPrice = search.maxPrice != null;

    if (hasMinPrice || hasMaxPrice) {
        if (!Number.isFinite(price)) {
            return false;
        }

        if (hasMinPrice && price < Number(search.minPrice)) {
            return false;
        }

        if (hasMaxPrice && price > Number(search.maxPrice)) {
            return false;
        }
    }

    // 4. مطابقة الموقع.
    if (search.location) {
        const postLocation = normalize(post.location);
        const searchLocation = normalize(search.location);

        if (!postLocation.includes(searchLocation)) {
            return false;
        }
    }

    // 5. مطابقة الكلمة المفتاحية.
    if (search.keyword) {
        const pattern = new RegExp(escapeRegex(search.keyword), 'i');

        const searchableText = [
            post.product_name,
            post.description,
            post.brand,
            post.model,
            post.category,
            postSubcategory,
            post.type,
        ]
            .filter(Boolean)
            .join(' ');

        if (!pattern.test(searchableText)) {
            return false;
        }
    }

    return true;
};

const matchSavedSearches = async (io, post) => {
    if (!post?._id || post.status !== 'accepted') {
        return { matched: 0, failed: 0, skipped: true };
    }

    const filter = {
        notificationsEnabled: true,
    };

    // لا نرسل إشعارًا للبائع عن إعلانه الخاص.
    if (post.seller) {
        filter.user = { $ne: post.seller };
    }

    const searches = await SavedSearch.find(filter).lean();

    let matched = 0;
    let failed = 0;
    let skippedExisting = 0;

    for (const search of searches) {
        if (!matchesSearch(search, post)) {
            continue;
        }

        try {
            // منع معالجة البحث والإعلان نفسيهما أكثر من مرة.
            const existingMatch = await SavedSearchMatch.exists({
                savedSearch: search._id,
                post: post._id,
            });

            if (existingMatch) {
                skippedExisting += 1;
                continue;
            }

            const notification = await notifyUser(io, search.user, {
                type: 'saved_search_match',
                title: 'لقينا صفقة بتناسبك 🔔',
                body: `الإعلان "${post.product_name}" مطابق لبحثك "${search.name}".`,
                postId: post._id,
                data: {
                    savedSearchId: String(search._id),
                    productName: String(post.product_name || ''),
                    category: String(post.category || ''),
                    subCategory: String(
                        post.subcategory ?? post.subCategory ?? '',
                    ),
                },
            });

            if (!notification) {
                failed += 1;
                continue;
            }

            // تسجيل المطابقة بعد تأكيد إنشاء الإشعار أو استرجاعه.
            await SavedSearchMatch.updateOne(
                {
                    savedSearch: search._id,
                    post: post._id,
                },
                {
                    $setOnInsert: {
                        savedSearch: search._id,
                        post: post._id,
                        user: search.user,
                        notifiedAt: new Date(),
                    },
                },
                { upsert: true },
            );

            matched += 1;
        } catch (error) {
            if (error?.code === 11000) {
                // مطابقة مسجلة مسبقًا بسبب طلب متزامن.
                skippedExisting += 1;
                continue;
            }

            failed += 1;

            console.error('[saved-searches] Matching failed:', {
                savedSearchId: String(search._id),
                postId: String(post._id),
                error: error.message,
            });
        }
    }

    const result = {
        matched,
        failed,
        skippedExisting,
    };

    console.log('[saved-searches] Matching completed:', {
        postId: String(post._id),
        ...result,
    });

    return result;
};

module.exports = {
    matchSavedSearches,
    matchesSearch,
};