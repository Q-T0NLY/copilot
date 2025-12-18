/**
 * TUI Command - Launch the Quantum TUI interface
 */

import { QuantumTUI } from '../tui/QuantumTUI.js';

export async function tuiCommand(options: any): Promise<void> {
  const tui = new QuantumTUI({
    theme: options.theme || 'quantum',
    animations: options.animations !== false,
    ghostSnapshot: options.ghostSnapshot !== false
  });
  
  await tui.start();
}
