import * as assert from "node:assert/strict";
import { test } from "node:test";
import * as path from "node:path";
import { playbackCommands } from "../src/audioPlayer";

test("uses the bundled PowerShell player on Windows", () => {
  const commands = playbackCommands("win32", "C:\\sounds\\faaah.mp3", "C:\\extension");

  assert.equal(commands.length, 1);
  assert.equal(commands[0].executable, "powershell.exe");
  assert.equal(commands[0].args.at(-1), "C:\\sounds\\faaah.mp3");
  assert.equal(commands[0].args.at(-2), path.join("C:\\extension", "scripts", "play-sound.ps1"));
});

test("uses afplay on macOS", () => {
  const commands = playbackCommands("darwin", "/sounds/faaah.mp3", "/extension");

  assert.deepEqual(commands, [{ executable: "/usr/bin/afplay", args: ["/sounds/faaah.mp3"] }]);
});

test("offers common Linux audio players as fallbacks", () => {
  const commands = playbackCommands("linux", "/sounds/faaah.mp3", "/extension");

  assert.deepEqual(
    commands.map((command) => command.executable),
    ["ffplay", "mpg123", "cvlc", "play"],
  );
});
