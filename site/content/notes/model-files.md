# Model files are code

At CONISOFT 2025 in La Paz, Azuany Mila, Dr. Zobeida Guzmán, and I ran a workshop we called "Models under attack." A lot of the room ships a `.pt` file the way they ship a zip.

Python's docs say the pickle module is not secure, and that you should only unpickle data you trust. A `.pkl`, `.pt`, or `.pth` can run code when you load it. Someone publishes a model, you call the loader, and you are running their program. That is the bug. It is not subtle.

The fixes we spent the hour on are dull on purpose.

- Prefer SafeTensors. The file is a header plus weights, not a pickle stream.
- If an old checkpoint has to be opened, open it in a container or a VM you can throw away, with no credentials and no home directory mounted in.

We stopped at the load path. That is enough to stop treating a download as data.
