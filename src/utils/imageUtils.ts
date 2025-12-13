const ImageSize = {
    THUMBNAIL: 'w_400',
    CARD: 'w_1000',
    HERO: 'w_1500'
};

const ImageQuality = {
    LOW: 'q_50',
    MEDIUM: 'q_auto',
    HIGH: 'q_auto:good',
    BEST: 'q_auto:best'
};

/**
 * Transform Cloudinary URL
 * @param {string} imageUrl - Either full URL or public_id
 * @param {string} size - One of ImageSize enum
 * @param {string} quality - One of ImageQuality enum
 * @param {string} [format] - Optional format (webp/avif). Default: auto
 * @returns {string} - Transformed Cloudinary URL
 */
function transformCloudinaryUrl(imageUrl, size = ImageSize.BLOG, quality = ImageQuality.MEDIUM, format = 'f_auto') {
    if (!imageUrl) return '';

    // Extract public_id if URL is full Cloudinary URL
    let publicId = imageUrl;

    try {
        const urlObj = new URL(imageUrl);
        const parts = urlObj.pathname.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        if (uploadIndex !== -1) {
            // everything after /upload/ is the public_id (remove file extension)
            publicId = parts.slice(uploadIndex + 1).join('/');
            publicId = publicId.replace(/\.[a-zA-Z]+$/, ''); // remove .jpg/.png
        }
    } catch (err) {
        // Not a full URL, assume it's already public_id
        console.log("Error not in cloudinary url format", err.message);
        return imageUrl;
    }

    // Construct transformed URL
    return `https://res.cloudinary.com/dxiuxuivf/image/upload/${size},${quality},${format}/${publicId}`;
}

export {
    ImageSize,
    ImageQuality,
    transformCloudinaryUrl
};
