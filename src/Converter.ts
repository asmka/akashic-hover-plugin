import { HoverableE } from "./HoverableE";
import { HoveredEvent, HoveringEvent, UnhoveredEvent } from "./HoverEvent";

/**
 * コンバータオプション。
 */
export interface ConverterOptions {
  /**
   * ホバー時のカーソルの形状。
   * CSSのcursorプロパティと同価。
   * @default HoverPluginに渡したcursorの値
   */
  cursor?: string;
}

/**
 * コンバータ機能を提供するクラス。
 */
export class Converter {
  /**
   * エンティティをホバー可能に変換する。
   */
  static asHoverable(e: g.E, opts?: ConverterOptions): HoverableE {
    const hoverableE = e as HoverableE;
    hoverableE.hoverable = true;
    hoverableE.touchable = true;
    hoverableE.hovered = hoverableE.hovered || new g.Trigger<HoveredEvent>();
    hoverableE.hovering = hoverableE.hovering || new g.Trigger<HoveringEvent>();
    hoverableE.unhovered =
      hoverableE.unhovered || new g.Trigger<UnhoveredEvent>();
    if (opts) {
      if (opts.cursor) hoverableE.cursor = opts.cursor;
    }
    return hoverableE;
  }

  /**
   * エンティティのホバーを解除する。
   */
  static asUnhoverable(e: g.E): g.E {
    const hoverableE = e as Partial<HoverableE>;
    delete hoverableE.hoverable;
    if (hoverableE.hovered && !hoverableE.hovered.destroyed()) {
      hoverableE.hovered.destroy();
      delete hoverableE.hovered;
    }
    if (hoverableE.hovering && !hoverableE.hovering.destroyed()) {
      hoverableE.hovering.destroy();
      delete hoverableE.hovering;
    }
    if (hoverableE.unhovered && !hoverableE.unhovered.destroyed()) {
      hoverableE.unhovered.destroy();
      delete hoverableE.unhovered;
    }
    return hoverableE as g.E;
  }
}
