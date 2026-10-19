// ── Cron Job: تعطيل الإعلانات المنتهية تلقائياً ──────────
// يعمل كل ساعة ليتحقق من الإعلانات المنتهية
cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const result = await FeaturedAd.updateMany(
            { 
                isActive: true, 
                endDate: { $lt: now } 
            },
            { 
                $set: { isActive: false } 
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`🕒 [CRON] تم تعطيل ${result.modifiedCount} إعلان منتهي الصلاحية.`);
        }
    } catch (err) {
        console.error('❌ [CRON] خطأ في تعطيل الإعلانات المنتهية:', err);
    }
});

module.exports = router;