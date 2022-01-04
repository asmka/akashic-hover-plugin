/**
 * イベントの種別。
 *
 * - `"hovered"`: ホバー開始イベント。
 * - `"hovering"`: ホバー移動イベント。
 * - `"unhoverd"`: ホバー終了イベント。
 */
export type HoverEventTypeString = "hovered" | "hovering" | "unhovered";

/**
 * イベントを表すインターフェース。
 */
export interface HoverEventBase {
  /**
   * イベントの種別。
   */
  type: HoverEventTypeString;
  point: g.CommonOffset;
}

export class HoveredEvent implements HoverEventBase {
  type: "hovered" = "hovered";
  point: g.CommonOffset;

  constructor(point: g.CommonOffset) {
    this.point = {
      x: point.x,
      y: point.y,
    };
  }
}

export class HoveringEvent implements HoverEventBase {
  type: "hovering" = "hovering";
  point: g.CommonOffset;
  prevDelta: g.CommonOffset;

  constructor(point: g.CommonOffset, prevDelta: g.CommonOffset) {
    this.point = {
      x: point.x,
      y: point.y,
    };
    this.prevDelta = {
      x: prevDelta.x,
      y: prevDelta.y,
    };
  }
}

export class UnhoveredEvent implements HoverEventBase {
  type: "unhovered" = "unhovered";
  point: g.CommonOffset;

  constructor(point: g.CommonOffset) {
    this.point = {
      x: point.x,
      y: point.y,
    };
  }
}
