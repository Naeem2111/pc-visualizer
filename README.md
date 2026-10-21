# Case Open

A visual desk and open-case builder. The drawing always shows the same studio desk: an open chassis, a monitor, a keyboard, a mouse, a headset on a stand, and a microphone on a boom arm. You name each part — or paste a spec list — and the labels on the picture update.

This page cannot see the computer you are using. Parts start blank on purpose. Nothing is filled in from a parts list we do not have.

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

The dev server listens on port **4317**.

## What you can do

- Click a shape in the drawing to select it and focus its field.
- Click a spec row to highlight that part on the desk.
- Type a name. Named parts fill in. Unnamed parts stay muted outlines with an Add label.
- Paste a spec list. One part per line, with a label before the colon:

```
GPU: graphics card you own
Headset: headset you own
Mic: microphone you own
CPU: processor
Cooler: cooler
Motherboard: motherboard
RAM: memory
Storage: drive
PSU: power supply
Case: case
Monitor: display
Keyboard: keyboard
Mouse: mouse
Build: My rig
```

Labels also accept aliases: processor, aio, mobo, graphics card, memory, ssd, nvme, power supply, display, headphones, and microphone. Lines that do not match are shown so you can fix them.

- Export JSON, or paste that JSON back in.
- The build is saved in this browser under `localStorage` (`case-open.build.v1`).

Headset and microphone are drawn on the desk, and they are the first fields in the parts list.

## Checks

```bash
npm test
npm run lint
npm run build
```
