export { Converter } from "./Converter";
export { HoverableE } from "./HoverableE";
export { HoveredEvent, HoveringEvent, UnhoveredEvent } from "./HoverEvent";

// HoverPlugin.ts で module.exports しているため、そのまま export すると使用側で型がおかしくなる。
// 後方互換性のため module.exports は残しここでキャストしている。
import * as plugin from "./HoverPlugin";
const hoverPlugin = plugin as g.OperationPluginStatic;
export { hoverPlugin as HoverPlugin };
