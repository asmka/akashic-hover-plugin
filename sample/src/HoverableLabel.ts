import * as hover from "@asmka/akashic-hover-plugin";

export class HoverableLabel extends g.Label implements hover.HoverableE {
  hoverable: boolean = true;
  hovered: g.Trigger<hover.HoveredEvent> = new g.Trigger<hover.HoveredEvent>();
  hovering: g.Trigger<hover.HoveringEvent> =
    new g.Trigger<hover.HoveringEvent>();
  unhovered: g.Trigger<hover.UnhoveredEvent> =
    new g.Trigger<hover.UnhoveredEvent>();
  _text: string;

  constructor(param: g.LabelParameterObject) {
    super(param);
    this._text = this.text;
    this.hovered.add(this.onHovered, this);
    this.hovering.add(this.onHovering, this);
    this.unhovered.add(this.onUnhovered, this);
  }

  onHovered(e: hover.HoveredEvent): void {
    this.text = "hover!";
    this.textColor = "#f00";
    this.invalidate();
  }

  onHovering(e: hover.HoveringEvent): void {
    this.x -= e.prevDelta.x;
    this.y -= e.prevDelta.y;
    this.modified();
  }

  onUnhovered(e: hover.UnhoveredEvent): void {
    this.text = this._text;
    this.textColor = "#000";
    this.invalidate();
  }
}
