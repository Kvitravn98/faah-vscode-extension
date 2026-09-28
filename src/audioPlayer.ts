import { ChildProcess, spawn } from "node:child_process";
import * as path from "node:path";

export interface PlaybackCommand {
  executable: string;
  args: string[];
}

export type SupportedPlatform = NodeJS.Platform;

export function playbackCommands(
  platform: SupportedPlatform,
  soundPath: string,
  extensionPath: string,
): PlaybackCommand[] {
  switch (platform) {
    case "win32":
      return [
        {
          executable: "powershell.exe",
          args: [
            "-NoLogo",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            path.join(extensionPath, "scripts", "play-sound.ps1"),
            soundPath,
          ],
        },
      ];
    case "darwin":
      return [{ executable: "/usr/bin/afplay", args: [soundPath] }];
    default:
      return [
        { executable: "ffplay", args: ["-nodisp", "-autoexit", "-loglevel", "quiet", soundPath] },
        { executable: "mpg123", args: ["-q", soundPath] },
        { executable: "cvlc", args: ["--play-and-exit", "--intf", "dummy", soundPath] },
        { executable: "play", args: ["-q", soundPath] },
      ];
  }
}

type Logger = (message: string) => void;

/** Plays at most one copy of the sound at a time. */
export class AudioPlayer {
  private activeProcess: ChildProcess | undefined;

  public constructor(
    private readonly soundPath: string,
    private readonly extensionPath: string,
    private readonly platform: SupportedPlatform = process.platform,
    private readonly log: Logger = () => undefined,
  ) {}

  public play(): void {
    if (this.activeProcess !== undefined) {
      this.log("Playback skipped because the sound is already playing.");
      return;
    }

    const candidates = playbackCommands(this.platform, this.soundPath, this.extensionPath);
    this.startCandidate(candidates, 0);
  }

  private startCandidate(candidates: PlaybackCommand[], index: number): void {
    const candidate = candidates[index];
    if (candidate === undefined) {
      this.log("No supported audio player was found on this system.");
      return;
    }

    const child = spawn(candidate.executable, candidate.args, {
      windowsHide: true,
      stdio: "ignore",
    });
    this.activeProcess = child;

    child.once("error", (error) => {
      if (this.activeProcess === child) {
        this.activeProcess = undefined;
        this.log(`Could not start ${candidate.executable}: ${error.message}`);
        this.startCandidate(candidates, index + 1);
      }
    });

    child.once("exit", (code) => {
      if (this.activeProcess === child) {
        this.activeProcess = undefined;
      }
      if (code !== 0 && code !== null) {
        this.log(`${candidate.executable} exited with code ${code}.`);
      }
    });
  }
}
