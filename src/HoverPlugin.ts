import { HoverableE } from "./HoverableE";
import { HoveredEvent, HoveringEvent, UnhoveredEvent } from "./HoverEvent";
import { HoverPluginOptions } from "./HoverPluginOptions";

/**
 * ホバー機能を提供するプラグイン。
 */
export class HoverPlugin implements g.OperationPlugin {
  game: g.Game;
  view: HTMLElement;
  beforeHover: HoverableE | null;
  beforePoint: g.CommonOffset | null;
  operationTrigger: g.Trigger<g.OperationPluginOperation | (number | string)[]>;
  _cursor: string;
  _showTooltip: boolean;

  _onMouseMove_bound: (e: MouseEvent) => void;
  _onMouseOut_bound: (e: MouseEvent) => void;
  _getScale: (() => { x: number; y: number }) | null;

  static isSupported(): boolean {
    return (
      typeof document !== "undefined" &&
      typeof document.addEventListener === "function"
    );
  }

  constructor(
    game: g.Game,
    viewInfo: g.OperationPluginViewInfo,
    option: HoverPluginOptions = {}
  ) {
    this.game = game;
    this.view = viewInfo.view as HTMLElement;
    this.beforeHover = null;
    this.beforePoint = null;
    this.operationTrigger = new g.Trigger();
    this._cursor = option.cursor || "pointer";
    this._showTooltip = !!option.showTooltip;
    this._getScale = (viewInfo as any).getScale
      ? () => (viewInfo as any).getScale()
      : null;

    this._onMouseMove_bound = this._onMouseMove.bind(this);
    this._onMouseOut_bound = this._onMouseOut.bind(this);
  }

  start(): boolean {
    this.view.addEventListener("mousemove", this._onMouseMove_bound, false);
    this.view.addEventListener("mouseout", this._onMouseOut_bound, false);
    return true;
  }

  stop(): void {
    this.view.removeEventListener("mousemove", this._onMouseMove_bound, false);
    this.view.removeEventListener("mouseout", this._onMouseOut_bound, false);
  }

  _onMouseMove(e: MouseEvent): void {
    const scene = this.game.scene();
    if (!scene) return;

    const rect = this.view.getBoundingClientRect();
    const positionX = rect.left + window.pageXOffset;
    const positionY = rect.top + window.pageYOffset;
    const offsetX = e.pageX - positionX;
    const offsetY = e.pageY - positionY;
    let scale = { x: 1, y: 1 };
    if (this._getScale) {
      scale = this._getScale();
    }

    const point = { x: offsetX / scale.x, y: offsetY / scale.y };
    const target = scene.findPointSourceByPoint(point).target as HoverableE;
    if (target && target.hoverable) {
      if (target !== this.beforeHover) {
        if (this.beforeHover && this.beforeHover.hoverable) {
          this._onUnhovered(target, point);
        }
        this._onHovered(target, point);
      } else {
        this._onHovering(target, point);
      }
    } else if (this.beforeHover) {
      this._onUnhovered(this.beforeHover, point);
    }
    this.beforePoint = point;
  }

  _onHovered(target: HoverableE, point: g.CommonOffset): void {
    if (target.hoverable) {
      this.view.style.cursor = target.cursor ? target.cursor : this._cursor;
      if (this._showTooltip && target.title) {
        this.view.setAttribute("title", target.title);
      }
      const e = new HoveredEvent({
        x: point.x - target.x,
        y: point.y - target.y,
      });
      target.hovered.fire(e);
    }
    this.beforeHover = target;
  }

  _onHovering(target: HoverableE, point: g.CommonOffset): void {
    if (this.beforeHover && this.beforePoint) {
      const e = new HoveringEvent(
        {
          x: point.x - target.x,
          y: point.y - target.y,
        },
        {
          x: point.x - this.beforePoint.x,
          y: point.y - this.beforePoint.y,
        }
      );
      target.hovering.fire(e);
    }
  }

  _onUnhovered(target: HoverableE, point: g.CommonOffset): void {
    this.view.style.cursor = "auto";
    if (this.beforeHover && this.beforeHover.unhovered) {
      const e = new UnhoveredEvent({
        x: point.x - target.x,
        y: point.y - target.y,
      });
      this.beforeHover.unhovered.fire(e);
      if (this._showTooltip) {
        this.view.removeAttribute("title");
      }
    }
    this.beforeHover = null;
  }

  _onMouseOut(): void {
    if (this.beforeHover && this.beforePoint) {
      this._onUnhovered(this.beforeHover, this.beforePoint);
    }
  }
}

module.exports = HoverPlugin;
