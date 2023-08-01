# Moebius Effect

I was inspired by the video: [
Moebius-style 3D Rendering | Useless Game Dev](https://www.youtube.com/watch?v=jlKNOirh66E&ab_channel=UselessGameDev), and found that there's no implementation in three js. Probably because many of the implementations out there are based on shader graphs.

Basically, everything in that video was implemented in shader. In the video, the shadows were read from texture. Here I implemented them directly in shader.

Specular reflection and diffuse lighting are computed and those with high values are highlighted with an eggshell color.
