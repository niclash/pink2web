import {NodeEditor, NodeId} from 'rete';

import {Area2D, AreaExtensions, AreaPlugin, Drag} from 'rete-area-plugin';
import {ConnectionPlugin, Presets as ConnectionPresets,} from 'rete-connection-plugin';

import {Presets as VuePresets, VueArea2D, VuePlugin} from 'rete-vue-plugin';

import {AutoArrangePlugin, Presets as ArrangePresets,} from 'rete-auto-arrange-plugin';

import {ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets,} from 'rete-context-menu-plugin';
import {MinimapExtra, MinimapPlugin} from 'rete-minimap-plugin';
import {RerouteExtensions, RerouteExtra, ReroutePlugin,} from 'rete-connection-reroute-plugin';
import {Node, Schemes} from "@/components/model";
import {Position} from "rete-area-plugin/_types/types";
import {setupSelection} from "@/components/floweditor/selection";

type AreaExtra =
    | Area2D<Schemes>
    | VueArea2D<Schemes>
    | ContextMenuExtra
    | MinimapExtra
    | RerouteExtra;

export class FlowEditor extends NodeEditor<Schemes> {
    area: AreaPlugin<Schemes, AreaExtra>;
    nodeSelector: { select: (nodeId: NodeId, accumulate: boolean) => void; unselect: (nodeId: NodeId) => void } | undefined;

    constructor(area: AreaPlugin<Schemes, AreaExtra>) {
        super();
        this.area = area;
    }

    setPosition(id: string, {x, y}: Position): Promise<boolean | undefined> {
        let xy: Position = {x, y};
        return this.area.translate(id, xy);
    }

    addInitial(value:any, node: Node, nodePort: string, portIndex: number): Promise<boolean> {
        return new Promise( () => { return true } );
    }

    removeInitial( node:Node , port: string, index: number): Promise<boolean> {
        return new Promise( () => { return true } );
    }
}

export let editor: FlowEditor;

export async function createEditor(container: HTMLElement) {
    const area = new AreaPlugin<Schemes, AreaExtra>(container);
    editor = new FlowEditor(area);
    const connection = new ConnectionPlugin<Schemes, AreaExtra>();
    const vueRender = new VuePlugin<Schemes, AreaExtra>();
    const minimap = new MinimapPlugin<Schemes>();
    const reroutePlugin = new ReroutePlugin<Schemes>();

    editor.use(area);

    const arrange = new AutoArrangePlugin<Schemes>();
    arrange.addPreset(ArrangePresets.classic.setup());
    const contextMenu = new ContextMenuPlugin<Schemes>({
        items: ContextMenuPresets.classic.setup([
            ['Select All', () => {
                AreaExtensions.selector().unselectAll();
                editor.getNodes().forEach( (n) => {
                    editor.nodeSelector?.select(n.id, true);
                })
                return editor.getNodes()[0];
            }],
            ['Layout All', () => {
                arrange.layout();
                return editor.getNodes()[0];
            }],
            ['Zoom To Fit', () => {
                AreaExtensions.zoomAt(area, editor.getNodes());
                return editor.getNodes()[0];
            }],
        ]),
    });
    area.use(vueRender);
    area.use(connection);
    area.use(contextMenu);
    area.use(minimap);

    vueRender.use(reroutePlugin);

    connection.addPreset(ConnectionPresets.classic.setup());

    vueRender.addPreset(VuePresets.classic.setup());
    vueRender.addPreset(VuePresets.contextMenu.setup());
    vueRender.addPreset(VuePresets.minimap.setup());
    vueRender.addPreset(
        VuePresets.reroute.setup({
            contextMenu(id) {
                reroutePlugin.remove(id);
            },
            translate(id, dx, dy) {
                reroutePlugin.translate(id, dx, dy);
            },
            pointerdown(id) {
                reroutePlugin.unselect(id);
                reroutePlugin.select(id);
            },
        })
    );
    area.use(arrange);
    await arrange.layout();
    await AreaExtensions.zoomAt(area, editor.getNodes());
    const selector = AreaExtensions.selector();
    const accumulating = AreaExtensions.accumulateOnCtrl();
    editor.nodeSelector = AreaExtensions.selectableNodes(area, selector, {accumulating});


    const selection = setupSelection(area, {
        selected(ids) {
            const [first, ...rest] = ids

            selector.unselectAll()
            if (first) {
                editor.nodeSelector?.select(first, false);
            }
            for (const id of rest) {
                editor.nodeSelector?.select(id, true);
            }
        },
    });
    selection.setMode("center");
    selection.setShape("marquee");
    RerouteExtensions.selectablePins(reroutePlugin, selector, accumulating);
    return {
        setSelectionMode: selection.setMode,
        setSelectionShape: selection.setShape,
        setSelectionButton(button: 0 | 1) {
            const panningButton = button ? 0 : 1

            area.area.setDragHandler(new Drag({
                down: e => {
                    if (e.pointerType === 'mouse' && e.button !== panningButton) return false
                    e.preventDefault()
                    return true
                },
                move: () => true
            }))

            selection.setButton(button)
        },
        destroy: () => area.destroy(),
    };
}
