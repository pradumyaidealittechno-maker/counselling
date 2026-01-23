export const getSupportedMimeType = (): string => {
    const types = [
        // Chrome/Firefox/Opera (Preferred quality/compression)
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',

        // Safari/iOS (H.264/AAC is standard there)
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',

        // Generic fallbacks
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            console.log(`✅ Using supported mime type: ${type}`);
            return type;
        }
    }

    // If no specific type is found, return empty string to let browser let default
    console.log('⚠️ No specific mime type supported, using browser default');
    return '';
};
