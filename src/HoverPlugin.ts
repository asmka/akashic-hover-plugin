import { HoverableE } from "./HoverableE";
import { HoveredEvent, HoveringEvent, UnhoveredEvent } from "./HoverEvent";
import { HoverPluginOptions } from "./HoverPluginOptions";

/**
 * ホバー機能を提供するプラグイン。
 */
class HoverPlugin implements g.OperationPlugin {
  game: g.Game;
  view: HTMLElement;
  beforeHover: HoverableE | null;
  startPoint: Readonly<g.CommonOffset> | null;
  startWindowPoint: Readonly<g.CommonOffset> | null;
  prevWindowPoint: Readonly<g.CommonOffset> | null;
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
    viewInfo: g.OperationPluginViewInfo | null,
    option: HoverPluginOptions = {}
  ) {
    this.game = game;
    this.view = viewInfo!.view as HTMLElement; // viewInfo が必ず渡ってくるため null にはならない
    this.beforeHover = null;
    this.startPoint = null;
    this.startWindowPoint = null;
    this.prevWindowPoint = null;
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

    const windowPoint = { x: offsetX / scale.x, y: offsetY / scale.y };
    const camera = g.game.focusingCamera as g.Camera2D;
    let absPoint: Readonly<g.CommonOffset>;
    if (camera) {
      const cameraOrigin = {
        x:
          camera.x -
          camera.width * camera.scaleX * (camera.anchorX ? camera.anchorX : 0),
        y:
          camera.y -
          camera.height * camera.scaleY * (camera.anchorY ? camera.anchorY : 0),
      };
      absPoint = {
        x: cameraOrigin.x + windowPoint.x * camera.scaleX,
        y: cameraOrigin.y + windowPoint.y * camera.scaleY,
      };
    } else {
      absPoint = {
        x: windowPoint.x,
        y: windowPoint.y,
      };
    }

    const target = scene.findPointSourceByPoint(absPoint).target as HoverableE;
    if (target && target.hoverable) {
      if (target !== this.beforeHover) {
        if (this.beforeHover && this.beforeHover.hoverable) {
          this._onUnhovered(target, windowPoint);
        }
        this._onHovered(target, windowPoint, absPoint);
      } else {
        this._onHovering(target, windowPoint);
      }
    } else if (this.beforeHover) {
      this._onUnhovered(this.beforeHover, windowPoint);
    }
  }

  _onHovered(
    target: HoverableE,
    windowPoint: g.CommonOffset,
    absPoint: g.CommonOffset
  ): void {
    this.view.style.cursor = target.cursor ? target.cursor : this._cursor;
    if (this._showTooltip && target.title) {
      this.view.setAttribute("title", target.title);
    }
    const point = target.globalToLocal(absPoint);
    const e = new HoveredEvent(point);
    target.hovered.fire(e);

    this.beforeHover = target;
    this.startPoint = point;
    this.startWindowPoint = windowPoint;
    this.prevWindowPoint = windowPoint;
  }

  _onHovering(target: HoverableE, windowPoint: g.CommonOffset): void {
    if (this.startPoint && this.startWindowPoint && this.prevWindowPoint) {
      const startDelta = {
        x: windowPoint.x - this.startWindowPoint.x,
        y: windowPoint.y - this.startWindowPoint.y,
      };
      const prevDelta = {
        x: windowPoint.x - this.prevWindowPoint.x,
        y: windowPoint.y - this.prevWindowPoint.y,
      };
      const e = new HoveringEvent(this.startPoint, startDelta, prevDelta);
      target.hovering.fire(e);
    }
    this.prevWindowPoint = windowPoint;
  }

  _onUnhovered(_target: HoverableE, windowPoint: g.CommonOffset): void {
    this.view.style.cursor = "auto";
    if (
      this.beforeHover &&
      this.startPoint &&
      this.startWindowPoint &&
      this.prevWindowPoint
    ) {
      const startDelta = {
        x: windowPoint.x - this.startWindowPoint.x,
        y: windowPoint.y - this.startWindowPoint.y,
      };
      const prevDelta = {
        x: windowPoint.x - this.prevWindowPoint.x,
        y: windowPoint.y - this.prevWindowPoint.y,
      };
      const e = new UnhoveredEvent(this.startPoint, startDelta, prevDelta);
      this.beforeHover.unhovered.fire(e);
      if (this._showTooltip) {
        this.view.removeAttribute("title");
      }
    }
    this.beforeHover = null;
    this.startPoint = null;
    this.startWindowPoint = null;
    this.prevWindowPoint = null;
  }

  _onMouseOut(): void {
    if (this.beforeHover && this.prevWindowPoint) {
      this._onUnhovered(this.beforeHover, this.prevWindowPoint);
    }
  }
}

module.exports = HoverPlugin;
