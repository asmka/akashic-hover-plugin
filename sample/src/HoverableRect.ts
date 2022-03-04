import * as hover from "@asmka/akashic-hover-plugin";

export class HoverableRect extends g.FilledRect implements hover.HoverableE {
  hoverable: boolean = true;
  hovered: g.Trigger<hover.HoveredEvent> = new g.Trigger<hover.HoveredEvent>();
  hovering: g.Trigger<hover.HoveringEvent> =
    new g.Trigger<hover.HoveringEvent>();
  unhovered: g.Trigger<hover.UnhoveredEvent> =
    new g.Trigger<hover.UnhoveredEvent>();
  _cssColor: string;

  constructor(param: g.FilledRectParameterObject) {
    super(param);
    this._cssColor = this.cssColor;
    this.hovered.add(this.onHovered, this);
    this.hovering.add(this.onHovering, this);
    this.unhovered.add(this.onUnhovered, this);
  }

  onHovered(e: hover.HoveredEvent): void {
    this.cssColor = "#f00";
    this.modified();
  }

  onHovering(e: hover.HoveringEvent): void {
    this.x -= e.prevDelta.x;
    this.y -= e.prevDelta.y;
    this.modified();
  }

  onUnhovered(e: hover.UnhoveredEvent): void {
    this.cssColor = this._cssColor;
    this.modified();
  }
}
