const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Using ffmpeg binary:', ffmpeg);

const input = 'public/landing/vid1.mp4';
const output = 'public/landing/vid1_hd.mp4';

console.log(`\nStarting 1080p HD downscale for ${input} (Preserving high-quality)...`);
try {
    // -y: overwrite output
    // -vcodec libx264: universally supported H.264
    // -crf 18: High quality. Lower = higher quality. 18-20 is visually indistinguishable from source.
    // -preset slow: Take more time computing to ensure the best quality at the given bitrate
    // -an: Remove audio track (since the landing video is strictly muted background)
    // -vf scale=-2:1080: Resize to exactly 1080p height, automatically adjusting width
    execSync(`"${ffmpeg}" -y -i ${input} -vcodec libx264 -crf 18 -preset slow -an -vf scale=-2:1080 ${output}`, { stdio: 'inherit' });
    console.log(`Successfully converted to 1080p HD.`);
    
    // Overwrite the extremely high-resolution original file with the 1080p version
    fs.renameSync(output, input);
    console.log(`Replaced original ${input} with the HD version.`);
} catch (e) {
    console.error(`Failed to convert ${input}`, e.message);
}
console.log('Done!');
