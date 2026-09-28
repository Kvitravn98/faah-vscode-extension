import * as path from "node:path";
import * as vscode from "vscode";
import { AudioPlayer } from "./audioPlayer";

const configurationSection = "faaah";

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("FAAAH");
  const soundPath = path.join(context.extensionPath, "media", "faaah.mp3");
  const player = new AudioPlayer(soundPath, context.extensionPath, process.platform, (message) => {
    output.appendLine(message);
  });

  let lastPlaybackAt = 0;

  const reportFailure = (source: string, exitCode: number): void => {
    const configuration = vscode.workspace.getConfiguration(configurationSection);
    if (!configuration.get<boolean>("enabled", true)) {
      return;
    }

    const cooldownMs = configuration.get<number>("cooldownMs", 1500);
    const now = Date.now();
    if (now - lastPlaybackAt < cooldownMs) {
      output.appendLine(`Duplicate failure ignored (${source}, exit code ${exitCode}).`);
      return;
    }

    lastPlaybackAt = now;
    output.appendLine(`Failure detected (${source}, exit code ${exitCode}).`);
    player.play();

    if (configuration.get<boolean>("notifyOnError", false)) {
      void vscode.window.showErrorMessage(`FAAAH — ${source} failed with exit code ${exitCode}.`);
    }
  };

  context.subscriptions.push(
    output,
    vscode.window.onDidEndTerminalShellExecution((event) => {
      if (event.exitCode !== undefined && event.exitCode !== 0) {
        reportFailure(`terminal "${event.terminal.name}"`, event.exitCode);
      }
    }),
    vscode.tasks.onDidEndTaskProcess((event) => {
      if (event.exitCode !== undefined && event.exitCode !== 0) {
        reportFailure(`task "${event.execution.task.name}"`, event.exitCode);
      }
    }),
    vscode.commands.registerCommand("faaah.playSound", () => {
      player.play();
    }),
    vscode.commands.registerCommand("faaah.toggle", async () => {
      const configuration = vscode.workspace.getConfiguration(configurationSection);
      const nextValue = !configuration.get<boolean>("enabled", true);
      await configuration.update("enabled", nextValue, vscode.ConfigurationTarget.Global);
      void vscode.window.showInformationMessage(`FAAAH is now ${nextValue ? "enabled" : "disabled"}.`);
    }),
  );

  output.appendLine("FAAAH is listening for failed terminal commands and tasks.");
}

export function deactivate(): void {
  // All resources are owned by subscriptions or short-lived child processes.
}
