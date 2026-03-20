const ffmpeg = require('ffmpeg-static');
const { execSync } = require('child_process');

console.log('Using ffmpeg binary:', ffmpeg);

const videos = [
    { input: 'public/landing/vid1.mp4', output: 'public/landing/vid1_compressed.mp4' },
    { input: 'public/landing/scrollpanevideo.mp4', output: 'public/landing/scrollpanevideo_compressed.mp4' }
];

for (const { input, output } of videos) {
    console.log(`\nStarting compression for ${input}...`);
    try {
        // -y: overwrite output
        // -vcodec libx264: H.264 video codec
        // -crf 28: Aggressive compression (visually fine for background)
        // -preset fast: Balance between speed and compression
        // -an: Remove audio (since they are muted background videos anyway)
        // -vf scale=-2:720: Resize to 720p height to massively save bandwidth
        execSync(`"${ffmpeg}" -y -i ${input} -vcodec libx264 -crf 28 -preset fast -an -vf scale=-2:720 ${output}`, { stdio: 'inherit' });
        console.log(`Successfully compressed to ${output}`);
    } catch (e) {
        console.error(`Failed to compress ${input}`, e.message);
    }
}
console.log('Done!');
