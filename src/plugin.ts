import * as sdk from "@elgato/streamdeck";
import { BTController } from "./actions/bt-controller";
const streamDeck: any = (sdk as any).default ?? (sdk as any);

console.log("[BT-CONTROLLER] Plugin starting...");

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded
streamDeck.logger.setLevel("TRACE" as any);

console.log("[BT-CONTROLLER] Registering BTController action...");
// Register the BT controller action (manifest UUID is read from class via registration)
streamDeck.actions.registerAction(new BTController());

console.log("[BT-CONTROLLER] Connecting to Stream Deck...");
// Finally, connect to the Stream Deck.
streamDeck.connect();

console.log("[BT-CONTROLLER] Plugin initialization complete.");


