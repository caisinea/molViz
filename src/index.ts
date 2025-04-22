import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { Color } from 'molstar/lib/mol-util/color';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import { Asset } from 'molstar/lib/mol-util/assets';
import { PluginConfig } from 'molstar/lib/mol-plugin/config';
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';
import { PresetStructureRepresentations } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';

class MolVizWrapper {
    plugin!: PluginUIContext;

    async init(target: string | HTMLElement) {
        this.plugin = await createPluginUI(
            typeof target === 'string' ? document.getElementById(target)! : target,
            {
                ...DefaultPluginUISpec(),
                layout: {
                    initial: {
                        isExpanded: false,
                        showControls: false
                    }
                },
                config: [
                    [PluginConfig.Viewport.ShowExpand, false],
                    [PluginConfig.Viewport.ShowControls, false],
                    [PluginConfig.Viewport.ShowSettings, false],
                    //[PluginConfig.Viewport.ShowSelectionMode, false],
                    //[PluginConfig.Viewport.ShowAnimation, false],
                    //[PluginConfig.Viewport.ShowTrajectoryControls, false]
                    //[PluginConfig.Viewport.ShowScreenshotControls, false]
                ],
                components: {
                    remoteState: 'none',
                    controls: {
                        right: 'none',
                        top: 'none',
                        bottom: 'none',
                        left: 'none'
                    }
                }
            }
        );

        // Add event listeners for representation buttons
        document.getElementById('rep-cartoon')?.addEventListener('click', () => this.setRepresentation('cartoon'));
        document.getElementById('rep-surface')?.addEventListener('click', () => this.setRepresentation('molecular-surface'));
    }

    async setRepresentation(type: 'cartoon' | 'molecular-surface') {
        const { structures } = this.plugin.managers.structure.hierarchy.selection;
        if (!structures.length) return;

        if (type === 'cartoon') {
            await this.plugin.managers.structure.component.applyPreset(structures, PresetStructureRepresentations['polymer-and-ligand']);
        } else {
            await this.plugin.managers.structure.component.applyPreset(structures, PresetStructureRepresentations['coarse-surface']);
        }
    }

    async loadStructureFromUrl(url: string, format: BuiltInTrajectoryFormat) {
        await this.plugin.clear();
        const data = await this.plugin.builders.data.download({ url: Asset.Url(url) }, { state: { isGhost: true } });
        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
        await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
            structure: {
                name: 'model',
                params: {}
            },
            showUnitcell: false,
            representationPreset: 'auto'
        });
    }

    setBackground(color: number) {
        PluginCommands.Canvas3D.SetSettings(this.plugin, { 
            settings: props => { 
                props.renderer.backgroundColor = Color(color); 
            } 
        });
    }
}

// Initialize the viewer when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const molViz = new MolVizWrapper();
    await molViz.init('app');
    molViz.setBackground(0xffffff);
    molViz.loadStructureFromUrl('./hexokinase.pdb', 'pdb');
}); 