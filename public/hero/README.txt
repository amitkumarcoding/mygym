Hero media for the Ironline home page. Add your own licensed files here:

  gym-poster.jpg   Photo, 1920x1080 or larger, under 300 KB. Shows first and is the fallback.
  gym.mp4          H.264, 1920x1080, 8-15 seconds, no audio, under 4 MB. Loops silently.
  gym.webm         Optional, smaller VP9 version of the same clip.

Tips: pick a dark, low-key shot (barbell, chalk, rack, cable machine) so the headline stays readable.
Free licensed sources: Pexels, Pixabay, Unsplash (check each licence).
Compress video: ffmpeg -i in.mp4 -an -vf scale=1920:-2 -c:v libx264 -crf 28 -preset slow -movflags +faststart gym.mp4
If a file is missing, the hero falls back to a dark gold gradient.
